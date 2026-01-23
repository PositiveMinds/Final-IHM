/**
 * Professional AI Chatbot with Natural Language Processing
 * Retrieves patient data from Supabase based on user queries
 */

class HealthFlowChatbot {
    constructor() {
        this.conversationHistory = [];
        this.isLoading = false;
        this.maxMessages = 50; // Limit conversation history
        this.savedSearches = this.loadSavedSearches(); // Load saved searches from localStorage
        this.lastQueryResults = []; // Store results for export

        // Intent patterns for NLP
        this.intents = {
            greeting: {
                patterns: [
                    "hello|hi|hey|greetings|how are you|how's your day|how is your|what's up|good morning|good afternoon|good evening",
                ],
                keywords: [""],
            },
            date_range_query: {
                patterns: [
                    "appointment|visit|between|from|during|last|past",
                ],
                keywords: ["day|days|week|weeks|month|months|appointment|visit"],
            },
            hiv_positive_search: {
                patterns: [
                    "show|list|find|get|search|display|give me|tell me",
                ],
                keywords: ["hiv positive|hiv\\s*\\+|positive|hiv"],
            },
            patient_search: {
                patterns: [
                    "show|list|find|get|search|display|give me|find me|tell me|what|which",
                ],
                keywords: ["patient|patients", ""], // Empty keyword allows filter-based matching
            },
            patient_stats: {
                patterns: [
                    "how many|count|total|statistics|stats|summary|overview|number of",
                ],
                keywords: ["patient|patients|coming|appointment"],
            },
            appointment_stats: {
                patterns: [
                    "how many|count|total|number of",
                ],
                keywords: ["appointment|visit|coming|scheduled|today"],
            },
            date_range_query: {
                patterns: [
                    "between|from|during|date|today|tomorrow|day|period|range",
                ],
                keywords: ["appointment|visit|coming|scheduled"],
            },
            specific_patient: {
                patterns: ["patient|show|details|info|information"],
                keywords: [], // Only match if we can extract an actual patient ID
            },
            appointments: {
                patterns: ["appointment|scheduled|visit|next|upcoming|missed|when|coming|today"],
                keywords: [
                    "appointment|scheduled|visit|next|upcoming|missed|appointment|coming",
                ],
            },
            viral_suppression: {
                patterns: ["suppressing|suppressed|suppression|undetectable|not suppressing"],
                keywords: ["suppress|detectable|viral"],
            },
            viral_load: {
                patterns: ["viral|load|detectable|undetectable|hiv copies|vl|copies"],
                keywords: ["viral|detectable|undetectable|load|copies"],
            },
            pregnancy: {
                patterns: ["pregnant|pregnancy|mother|expecting|expecting mothers"],
                keywords: ["pregnant|pregnancy|mother|pregnant mothers"],
            },
            high_risk: {
                patterns: ["risk|alert|critical|urgent|concern|monitor|danger"],
                keywords: [
                    "risk|alert|critical|urgent|concern|monitor|danger|high risk",
                ],
            },
        };
    }

    /**
     * Process user query and determine intent
     */
    detectIntent(query) {
        const queryLower = query.toLowerCase().trim();
        let detectedIntents = [];

        // Check what filters are present in the query
        const filters = this.extractFilters(query);
        const hasFilters = Object.keys(filters).length > 0;

        // Define intent priority order (most specific first)
        const intentOrder = [
            "greeting",
            "date_range_query",
            "hiv_positive_search",
            "patient_stats",
            "viral_load",
            "high_risk",
            "appointments",
            "patient_search",
            "specific_patient",
        ];

        for (const intentName of intentOrder) {
            const intentData = this.intents[intentName];
            if (!intentData) continue;

            const patternMatch = intentData.patterns.some((pattern) =>
                new RegExp(pattern).test(queryLower)
            );

            const keywordMatch =
                intentData.keywords.length === 0 ||
                intentData.keywords.some((kw) => {
                    try {
                        return new RegExp(kw).test(queryLower);
                    } catch {
                        return queryLower.includes(kw);
                    }
                });

            console.log(
                `Intent check - ${intentName}: pattern=${patternMatch}, keyword=${keywordMatch}`
            );

            if (patternMatch && keywordMatch) {
                console.log(`Intent matched: ${intentName}`);
                detectedIntents.push(intentName);
                break; // Return first matching intent (in priority order)
            }
        }

        // If no intent matched but filters are present, default to patient_search
        if (detectedIntents.length === 0 && hasFilters) {
            console.log(
                "No intent matched but filters found - defaulting to patient_search"
            );
            return "patient_search";
        }

        return detectedIntents.length > 0 ? detectedIntents[0] : "general_query";
    }

    /**
     * Extract filter parameters from query
     */
    extractFilters(query) {
        const queryLower = query.toLowerCase();
        const filters = {};

        // Extract patient ID/number (must be preceded by "patient")
        // Match patterns like: "patient PAT0025", "patient 0025", "patient number 123"
        const patientMatch = query.match(
            /patient[s]?\s*(?:no\.?|number|#)?\s*([A-Z]*\d{3,})(?:\s|$)/i
        );
        if (patientMatch) {
            // Extract patient number (could be PAT0025 or just 0025)
            let patientId = patientMatch[1];
            // If it's just numbers, prepend PAT
            if (/^\d+$/.test(patientId)) {
                patientId = "PAT" + patientId.padStart(4, "0");
            }
            filters.patient_no = patientId;
            console.log("Extracted patient number:", filters.patient_no);
        }

        // Extract status
        if (/active|ongoing/i.test(queryLower)) filters.status = "Active";
        if (/inactive|discharged/i.test(queryLower)) filters.status = "Inactive";
        if (/critical|alert|urgent/i.test(queryLower)) filters.status = "Critical";

        // Extract HIV status - check for both explicit hiv mentions and common patterns
        if (/positive|hiv\s*\+|hiv\+|confirmed hiv/i.test(queryLower))
            filters.hiv_status = "Positive";
        if (/negative|hiv\s*\-|hiv\-|uninfected/i.test(queryLower))
            filters.hiv_status = "Negative";

        // Extract condition - check if any condition keywords are present
        // Check for HTN (Hypertension) BEFORE checking for HIV to avoid false matches
        if (/\bhtn\b|hypertension|high blood pressure|hbp/i.test(queryLower)) {
            filters.condition = "Hypertension";
            console.log("Matched Hypertension");
        }
        // NOTE: Don't set condition filter for HIV queries since hiv_status filter is more specific
        else if (/\bhiv\b|aids/i.test(queryLower) && !filters.hiv_status) {
            filters.condition = "HIV/AIDS";
            console.log("Matched HIV/AIDS");
        }
        if (/diabetes|diabetic|type 2|t2dm/i.test(queryLower)) {
            filters.condition = "Diabetes";
            console.log("Matched Diabetes");
        }
        if (/tuberculosis|tb(?!\w)/i.test(queryLower)) {
            filters.condition = "TB";
            console.log("Matched TB");
        }
        if (/cancer/i.test(queryLower)) {
            filters.condition = "Cancer";
            console.log("Matched Cancer");
        }
        if (/pregnancy|pregnant|expecting mother/i.test(queryLower)) {
            filters.is_pregnant = true;
            console.log("Matched Pregnant");
        }

        // Extract viral load status
        if (/detectable/i.test(queryLower))
            filters.viral_load_status = "Detectable";
        if (/undetectable/i.test(queryLower))
            filters.viral_load_status = "Undetectable";

        // Extract viral suppression status (inverse of detectable)
        if (/not suppressing|suppression failure|unsuppressed|not suppressed/i.test(queryLower)) {
            filters.viral_load_status = "Detectable";
            filters.search_type = "not_suppressing";
            console.log("Matched Not Suppressing");
        }
        if (/suppressing|suppressed|well suppressed|adequately suppressed/i.test(queryLower)) {
            filters.viral_load_status = "Undetectable";
            filters.search_type = "suppressing";
            console.log("Matched Suppressing");
        }

        // Extract gender
        if (/\bmale\b|\bmen\b|\bboys\b/i.test(queryLower)) filters.gender = "M";
        if (/\bfemale\b|\bwomen\b|\bgirls\b/i.test(queryLower))
            filters.gender = "F";

        // Extract age range
        const ageMatch = queryLower.match(
            /(?:age|aged|over|above|older than)\s*(\d+)/
        );
        if (ageMatch) filters.min_age = parseInt(ageMatch[1]);

        // Extract date range for appointments
        // Pattern: "between 15 february and 31 february", "from 15 to 31 february", etc.
        const dateRangeMatch = query.match(
            /(?:between|from)\s+(\d{1,2})\s+([a-z]+)\s+(?:and|to)\s+(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?/i
        );
        if (dateRangeMatch) {
            const monthMap = {
                january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
                july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
                jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
            };
            const monthFrom = monthMap[dateRangeMatch[2].toLowerCase()];
            const monthTo = monthMap[dateRangeMatch[4].toLowerCase()];
            const year = parseInt(dateRangeMatch[5]) || new Date().getFullYear();
            
            if (monthFrom && monthTo) {
                filters.date_from = new Date(year, monthFrom - 1, parseInt(dateRangeMatch[1])).toISOString();
                filters.date_to = new Date(year, monthTo - 1, parseInt(dateRangeMatch[3])).toISOString();
                filters.date_range_query = true;
                console.log("Extracted date range:", filters.date_from, "-", filters.date_to);
            }
        }

        // Check for "today" appointments
        if (/today|this\s+day|same\s+day/i.test(queryLower)) {
            const today = new Date();
            filters.appointment_date = today.toISOString().split('T')[0];
            filters.is_today = true;
            console.log("Looking for appointments today");
        }

        // Check for past appointments (last X days)
        const pastDaysMatch = queryLower.match(/(?:last|past)\s+(\d+)\s+days?/i);
        if (pastDaysMatch) {
            const days = parseInt(pastDaysMatch[1]);
            const today = new Date();
            const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
            filters.date_from = pastDate.toISOString().split('T')[0];
            filters.date_to = today.toISOString().split('T')[0];
            filters.date_range_query = true;
            filters.is_past_appointments = true;
            console.log(`Looking for appointments from last ${days} days`);
        }

        // Check for upcoming appointments
        if (/upcoming|next|coming/i.test(queryLower)) {
            filters.is_upcoming = true;
            console.log("Looking for upcoming appointments");
        }

        return filters;
    }

    /**
     * Query Supabase for patients based on filters
     */
    async queryPatients(filters) {
        try {
            if (!window.supabaseClient) {
                console.error("Supabase client not initialized");
                throw new Error(
                    "Database connection not available. Please ensure the page is fully loaded."
                );
            }

            console.log(
                "Supabase client available, querying patients with filters:",
                filters
            );
            console.log("Filter details - hiv_status:", filters.hiv_status, "condition:", filters.condition);

            let query = window.supabaseClient.from("patients").select("*");

            // Apply filters
            if (filters.patient_no) {
                query = query.eq("patient_no", filters.patient_no);
            }
            if (filters.status) {
                query = query.eq("status", filters.status);
            }
            if (filters.hiv_status) {
                query = query.eq("hiv_status", filters.hiv_status);
            }
            if (filters.condition) {
                // Use ilike for partial matching since conditions can be combined (e.g., "HIV Hypertension")
                query = query.ilike("condition", `%${filters.condition}%`);
            }
            if (filters.viral_load_status) {
                query = query.eq("viral_load_status", filters.viral_load_status);
            }
            if (filters.gender) {
                query = query.eq("gender", filters.gender);
            }
            if (filters.min_age) {
                query = query.gte("age", filters.min_age);
            }

            // Limit results
            query = query.limit(20);

            const {
                data,
                error
            } = await query;

            if (error) {
                console.error("Supabase query error:", error);
                throw error;
            }

            console.log("Query filters:", filters);
            console.log("Query results count:", data?.length || 0);
            console.log("Full query results:", data);

            // If no results and filters were applied, try without filters
            if ((!data || data.length === 0) && Object.keys(filters).length > 0) {
                console.log("No results with filters, trying without filters...");
                const allQuery = window.supabaseClient
                    .from("patients")
                    .select("*")
                    .limit(100);
                const {
                    data: allData,
                    error: allError
                } = await allQuery;
                console.log("Sample data without filters:", allData?.slice(0, 5));
                if (allData && allData.length > 0) {
                    console.log("Total patients in DB:", allData.length);
                    console.log("Sample patient structure:", allData[0]);
                    console.log("Applied filters were:", filters);
                    console.log("Available status values:", [
                        ...new Set(allData.map((p) => p.status)),
                    ]);
                    console.log("Available condition values:", [
                        ...new Set(allData.map((p) => p.condition)),
                    ]);
                    console.log("Available hiv_status values:", [
                        ...new Set(allData.map((p) => p.hiv_status)),
                    ]);
                }
            }

            return data || [];
        } catch (error) {
            console.error("Query error:", error);
            throw error;
        }
    }

    /**
     * Get statistics based on filters
     */
    async getStatistics(filters) {
        try {
            if (!window.supabaseClient) {
                throw new Error("Database connection not available");
            }

            let query = window.supabaseClient.from("patients").select("*");

            // Apply filters for stats
            if (filters.status) query = query.eq("status", filters.status);
            if (filters.hiv_status)
                query = query.eq("hiv_status", filters.hiv_status);
            if (filters.condition) query = query.eq("condition", filters.condition);

            const {
                data,
                error
            } = await query;
            if (error) throw error;

            const patients = data || [];
            return {
                total: patients.length,
                byStatus: this.countBy(patients, "status"),
                byCondition: this.countBy(patients, "condition"),
                byHIVStatus: this.countBy(patients, "hiv_status"),
                avgAge: patients.length > 0 ?
                    Math.round(
                        patients.reduce((sum, p) => sum + (p.age || 0), 0) /
                        patients.length
                    ) : 0,
            };
        } catch (error) {
            console.error("Statistics error:", error);
            throw error;
        }
    }

    /**
     * Utility: count occurrences by field
     */
    countBy(array, field) {
        return array.reduce((acc, obj) => {
            const key = obj[field] || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Format patient data for display
     */
    formatPatientResponse(patients) {
        if (patients.length === 0) {
            return `<strong>No patients found matching your criteria.</strong><br/><small class="text-muted">Check your filters or try a different search.</small>`;
        }

        if (patients.length === 1) {
            const p = patients[0];
            return `
<strong>Patient Found:</strong>
<br/>ID: ${p.patient_no} | Name: ${p.first_name} ${p.last_name}
<br/>Age: ${p.age} | Gender: ${p.gender}
<br/>Status: <span class="badge bg-info">${p.status}</span>
<br/>Condition: ${p.condition || "N/A"}
<br/>HIV Status: <span class="badge ${
        p.hiv_status === "Positive" ? "bg-danger" : "bg-success"
      }">${p.hiv_status || "Unknown"}</span>
${
  p.viral_load_status
    ? `<br/>Viral Load: <span class="badge bg-warning">${p.viral_load_status}</span>`
    : ""
}
${
  p.next_appointment
    ? `<br/>Next Appointment: ${new Date(
        p.next_appointment
      ).toLocaleDateString()}`
    : ""
}
${p.notes ? `<br/>Notes: ${p.notes}` : ""}
      `;
        }

        // Multiple patients - show as table
        let html = `<strong>Found ${patients.length} patients:</strong><br/>
<table class="table table-sm table-striped mt-2">
<thead><tr>
<th>ID</th><th>Name</th><th>Age</th><th>Status</th><th>Condition</th><th>HIV</th>
</tr></thead><tbody>`;

        patients.forEach((p) => {
            html += `<tr>
<td>${p.patient_no}</td>
<td>${p.first_name} ${p.last_name}</td>
<td>${p.age}</td>
<td><span class="badge bg-info">${p.status}</span></td>
<td>${p.condition || "—"}</td>
<td><span class="badge ${
        p.hiv_status === "Positive" ? "bg-danger" : "bg-success"
      }">${p.hiv_status || "?"}</span></td>
</tr>`;
        });

        html += "</tbody></table>";
        return html;
    }

    /**
     * Get current time of day period
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return { period: 'morning', greeting: 'Good morning' };
        } else if (hour >= 12 && hour < 17) {
            return { period: 'afternoon', greeting: 'Good afternoon' };
        } else if (hour >= 17 && hour < 21) {
            return { period: 'evening', greeting: 'Good evening' };
        } else {
            return { period: 'night', greeting: 'Good night' };
        }
    }

    /**
     * Generate smart greeting response
     */
    generateGreetingResponse(userMessage) {
        const timeInfo = this.getTimeOfDay();
        const timeGreeting = timeInfo.greeting;
        
        const greetingResponses = {
            morning: [
                `${timeGreeting}! ☀️ I'm <strong>Charlie</strong>, your HealthFlow AI Health Assistant. Ready to help you with patient data today?`,
                `${timeGreeting}! ☀️ I'm <strong>Charlie</strong> from <strong>HealthFlow</strong>. Great to see you this morning! How can I assist with your patients?`,
                `${timeGreeting}! ☀️ I'm <strong>Charlie</strong>, powered by HealthFlow. Let's make it a productive morning—what patient information do you need?`,
            ],
            afternoon: [
                `${timeGreeting}! 🌤️ I'm <strong>Charlie</strong>, your HealthFlow AI Health Assistant. How's your afternoon going? What can I help with?`,
                `${timeGreeting}! 🌤️ I'm <strong>Charlie</strong> from <strong>HealthFlow</strong>. I hope you're having a great day! What patient data can I assist with?`,
                `${timeGreeting}! 🌤️ I'm <strong>Charlie</strong>, HealthFlow's AI assistant. Ready to help you manage patient information efficiently.`,
            ],
            evening: [
                `${timeGreeting}! 🌙 I'm <strong>Charlie</strong>, your HealthFlow AI Health Assistant. How can I help you wrap up the day?`,
                `${timeGreeting}! 🌙 I'm <strong>Charlie</strong> from <strong>HealthFlow</strong>. Still here to help with your patient needs!`,
                `${timeGreeting}! 🌙 I'm <strong>Charlie</strong>, HealthFlow's AI assistant. Let's make this evening productive—what do you need?`,
            ],
            night: [
                `${timeGreeting}! 🌟 I'm <strong>Charlie</strong>, your HealthFlow AI Health Assistant. Still working hard? How can I help?`,
                `${timeGreeting}! 🌟 I'm <strong>Charlie</strong> from <strong>HealthFlow</strong>. Always available to assist with patient data!`,
                `${timeGreeting}! 🌟 I'm <strong>Charlie</strong>, HealthFlow's AI assistant. Ready to help with your patient queries anytime.`,
            ],
        };

        // Get responses for current time period
        const periodResponses = greetingResponses[timeInfo.period];
        const response = periodResponses[Math.floor(Math.random() * periodResponses.length)];
        
        // Add company info
        const companyInfo = `<br/><br/><small style="color: #666; font-size: 12px;">
            <strong>HealthFlow</strong> - AI-Driven Healthcare Company<br/>
            Co-founded by <strong>Bwoye Charles</strong> in 2026<br/>
            Automating healthcare for African facilities
        </small>`;
        
        return response + companyInfo;
    }

    /**
     * Format statistics response
     */
    formatStatsResponse(stats) {
        let html = `<strong>Patient Statistics:</strong><br/>
<br/>Total Patients: <strong>${stats.total}</strong>
<br/>Average Age: <strong>${stats.avgAge} years</strong>
<br/><br/><strong>By Status:</strong><br/>`;

        for (const [status, count] of Object.entries(stats.byStatus)) {
            html += `${status}: ${count} <br/>`;
        }

        html += "<br/><strong>By Condition:</strong><br/>";
        for (const [condition, count] of Object.entries(stats.byCondition)) {
            html += `${condition}: ${count} <br/>`;
        }

        html += "<br/><strong>By HIV Status:</strong><br/>";
        for (const [status, count] of Object.entries(stats.byHIVStatus)) {
            html += `${status}: ${count} <br/>`;
        }

        return html;
    }

    /**
     * Process user message and generate response
     */
    async processMessage(userMessage) {
        this.isLoading = true;
        let detectedIntent = "general_query"; // Initialize variable

        try {
            // Add user message to history
            this.conversationHistory.push({
                role: "user",
                content: userMessage,
                timestamp: new Date(),
            });

            // Detect intent
            detectedIntent = this.detectIntent(userMessage);
            console.log("Detected intent:", detectedIntent);

            // Extract filters
            const filters = this.extractFilters(userMessage);
            console.log("Extracted filters:", filters);

            let botResponse = "";

            // Process based on intent
            if (detectedIntent === "greeting") {
                botResponse = this.generateGreetingResponse(userMessage);
            }
            // If specific_patient intent but no patient_no extracted, treat as patient_search
            else if (detectedIntent === "specific_patient" && !filters.patient_no) {
                detectedIntent = "patient_search";
            }

            if (
                detectedIntent === "patient_search" ||
                detectedIntent === "hiv_positive_search" ||
                detectedIntent === "specific_patient"
            ) {
                try {
                    const patients = await this.queryPatients(filters);
                    console.log("Patients found:", patients);
                    console.log("Applied filters:", filters);
                    // Store results for export
                    this.lastQueryResults = patients;
                    if (patients.length === 0 && Object.keys(filters).length === 0) {
                        // No filters applied and no results, try to fetch all patients
                        const allPatients = await this.queryPatients({});
                        this.lastQueryResults = allPatients;
                        botResponse = this.formatPatientResponse(allPatients);
                    } else {
                        botResponse = this.formatPatientResponse(patients);
                    }
                } catch (error) {
                    console.error("Error fetching patients:", error);
                    botResponse = `<strong>Error retrieving patient data:</strong> ${error.message}<br/><small>Please check the database connection and try again.</small>`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "patient_stats") {
                try {
                    const stats = await this.getStatistics(filters);
                    botResponse = this.formatStatsResponse(stats);
                    // Store stats results for export
                    this.lastQueryResults = [];
                } catch (error) {
                    console.error("Error fetching statistics:", error);
                    botResponse = `Error retrieving statistics: ${error.message}. Please check the database connection.`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "appointment_stats") {
                try {
                    const patients = await this.queryPatients(filters);
                    const withAppointments = patients.filter((p) => p.next_appointment);
                    this.lastQueryResults = withAppointments;
                    
                    botResponse = `<strong>Appointment Statistics:</strong><br/>
                    Total patients with appointments: <strong>${withAppointments.length}</strong>`;
                    
                    if (filters.is_today) {
                        const todayAppointments = withAppointments.filter(p => {
                            const appointDate = new Date(p.next_appointment).toDateString();
                            return appointDate === new Date().toDateString();
                        });
                        botResponse = `<strong>Appointments Today:</strong><br/>
                        Total: <strong>${todayAppointments.length}</strong><br/>`;
                    }
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                    botResponse = `Error retrieving appointments: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "date_range_query") {
                try {
                    const patients = await this.queryPatients(filters);
                    
                    // Determine which appointment field to use
                    const appointmentField = filters.is_past_appointments ? 'visit_date' : 'next_appointment';
                    console.log("Date range query - Using field:", appointmentField, "is_past_appointments:", filters.is_past_appointments);
                    
                    const withAppointments = patients.filter((p) => p[appointmentField]);
                    console.log("Patients with appointment field:", withAppointments.length, "out of", patients.length);
                    
                    if (filters.date_range_query && filters.date_from && filters.date_to) {
                        const dateFrom = new Date(filters.date_from);
                        const dateTo = new Date(filters.date_to);
                        // Set end date to end of day
                        dateTo.setHours(23, 59, 59, 999);
                        console.log("Date range:", dateFrom, "to", dateTo);
                        
                        const inRangeAppointments = withAppointments.filter(p => {
                            const appointDate = new Date(p[appointmentField]);
                            return appointDate >= dateFrom && appointDate <= dateTo;
                        });
                        
                        console.log("Appointments in range:", inRangeAppointments.length);
                        this.lastQueryResults = inRangeAppointments;
                        const rangeLabel = filters.is_past_appointments ? 'Past Appointments' : 'Future Appointments';
                        botResponse = `<strong>${rangeLabel} between ${dateFrom.toLocaleDateString()} and ${dateTo.toLocaleDateString()}:</strong><br/>
                        Total: <strong>${inRangeAppointments.length}</strong><br/>`;
                        
                        if (inRangeAppointments.length > 0) {
                            botResponse += '<table class="table table-sm table-striped mt-2"><thead><tr><th>Patient</th><th>Appointment Date</th></tr></thead><tbody>';
                            inRangeAppointments.forEach((p) => {
                                const appointmentDate = new Date(p[appointmentField]).toLocaleDateString();
                                botResponse += `<tr><td>${p.first_name} ${p.last_name}</td><td>${appointmentDate}</td></tr>`;
                            });
                            botResponse += '</tbody></table>';
                        }
                    }
                } catch (error) {
                    console.error("Error fetching date range appointments:", error);
                    botResponse = `<strong>Error retrieving appointments:</strong> ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "pregnancy") {
                try {
                    const patients = await this.queryPatients(filters);
                    // Filter for pregnant patients (assuming there's a pregnancy field in DB)
                    const pregnant = patients.filter((p) => p.is_pregnant || p.pregnancy_status === "Pregnant");
                    this.lastQueryResults = pregnant;
                    
                    botResponse = `<strong>Pregnant Mothers:</strong><br/>
                    Total: <strong>${pregnant.length}</strong><br/>`;
                    
                    if (pregnant.length > 0) {
                        botResponse += '<table class="table table-sm table-striped mt-2"><thead><tr><th>Name</th><th>Age</th><th>Status</th></tr></thead><tbody>';
                        pregnant.forEach((p) => {
                            botResponse += `<tr><td>${p.first_name} ${p.last_name}</td><td>${p.age}</td><td>${p.status}</td></tr>`;
                        });
                        botResponse += '</tbody></table>';
                    }
                } catch (error) {
                    console.error("Error fetching pregnant patients:", error);
                    botResponse = `Error retrieving data: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "viral_suppression") {
                try {
                    const patients = await this.queryPatients(filters);
                    const withViralStatus = patients.filter((p) => p.viral_load_status);
                    this.lastQueryResults = withViralStatus;
                    
                    if (filters.search_type === "not_suppressing") {
                        const notSuppressing = withViralStatus.filter((p) => p.viral_load_status === "Detectable");
                        this.lastQueryResults = notSuppressing;
                        botResponse = `<strong>Patients Not Suppressing Virus (Detectable Viral Load):</strong><br/>
                        Total: <strong>${notSuppressing.length}</strong><br/>`;
                        
                        if (notSuppressing.length > 0) {
                            botResponse += '<table class="table table-sm table-striped mt-2"><thead><tr><th>Patient</th><th>Viral Load</th><th>Copies</th></tr></thead><tbody>';
                            notSuppressing.forEach((p) => {
                                botResponse += `<tr><td>${p.first_name} ${p.last_name}</td><td>${p.viral_load_status}</td><td>${p.viral_load_copies || "N/A"}</td></tr>`;
                            });
                            botResponse += '</tbody></table>';
                        }
                    } else if (filters.search_type === "suppressing") {
                        const suppressing = withViralStatus.filter((p) => p.viral_load_status === "Undetectable");
                        this.lastQueryResults = suppressing;
                        botResponse = `<strong>Patients With Viral Suppression (Undetectable Viral Load):</strong><br/>
                        Total: <strong>${suppressing.length}</strong><br/>`;
                        
                        if (suppressing.length > 0) {
                            botResponse += '<table class="table table-sm table-striped mt-2"><thead><tr><th>Patient</th><th>Viral Load</th></tr></thead><tbody>';
                            suppressing.forEach((p) => {
                                botResponse += `<tr><td>${p.first_name} ${p.last_name}</td><td>${p.viral_load_status}</td></tr>`;
                            });
                            botResponse += '</tbody></table>';
                        }
                    }
                } catch (error) {
                    console.error("Error fetching viral suppression data:", error);
                    botResponse = `Error retrieving data: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "appointments") {
                try {
                    const patients = await this.queryPatients({
                        ...filters
                    });
                    const withAppointments = patients.filter((p) => p.next_appointment);
                    // Store appointment results for export
                    this.lastQueryResults = withAppointments;
                    if (withAppointments.length > 0) {
                        botResponse = `<strong>Upcoming Appointments (${withAppointments.length}):</strong><br/>`;
                        withAppointments.forEach((p) => {
                            botResponse += `${p.first_name} ${p.last_name} - ${new Date(
                p.next_appointment
              ).toLocaleDateString()}<br/>`;
                        });
                    } else {
                        botResponse = "No upcoming appointments found.";
                    }
                } catch (error) {
                    console.error("Error fetching appointments:", error);
                    botResponse = `Error retrieving appointments: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "viral_load") {
                try {
                    const patients = await this.queryPatients({
                        ...filters
                    });
                    const withViralLoad = patients.filter((p) => p.viral_load_status);
                    // Store viral load results for export
                    this.lastQueryResults = withViralLoad;
                    if (withViralLoad.length > 0) {
                        botResponse = `<strong>Viral Load Status (${withViralLoad.length} patients):</strong><br/>`;
                        withViralLoad.forEach((p) => {
                            botResponse += `${p.first_name} ${p.last_name}: ${p.viral_load_status}`;
                            if (p.viral_load_copies)
                                botResponse += ` (${p.viral_load_copies} copies)`;
                            botResponse += "<br/>";
                        });
                    } else {
                        botResponse = "No viral load data found.";
                    }
                } catch (error) {
                    console.error("Error fetching viral load data:", error);
                    botResponse = `Error retrieving viral load data: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else if (detectedIntent === "high_risk") {
                try {
                    const patients = await this.queryPatients({
                        status: "Critical",
                        ...filters,
                    });
                    // Store high-risk results for export
                    this.lastQueryResults = patients;
                    if (patients.length > 0) {
                        botResponse = `<strong>High-Risk Patients (${patients.length}):</strong><br/>`;
                        botResponse += this.formatPatientResponse(patients);
                    } else {
                        botResponse = "No critical patients at this time.";
                    }
                } catch (error) {
                    console.error("Error fetching high-risk patients:", error);
                    botResponse = `Error retrieving high-risk patients: ${error.message}`;
                    this.lastQueryResults = [];
                }
            } else {
                botResponse =
                    'I can help you search for patients. Try asking things like:<br/>- "Show me all HIV positive patients"<br/>- "List patients with diabetes"<br/>- "How many active patients do we have?"<br/>- "Show critical patients"';
                this.lastQueryResults = [];
            }

            // Add bot response to history
            this.conversationHistory.push({
                role: "bot",
                content: botResponse,
                timestamp: new Date(),
            });

            // Trim history if too long
            if (this.conversationHistory.length > this.maxMessages) {
                this.conversationHistory = this.conversationHistory.slice(
                    -this.maxMessages
                );
            }

            return botResponse;
        } catch (error) {
            const errorMessage = `Sorry, I encountered an error: ${error.message}. Please try again.`;
            this.conversationHistory.push({
                role: "bot",
                content: errorMessage,
                timestamp: new Date(),
            });
            return errorMessage;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Clear conversation
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Save a search to localStorage
     */
    saveSearch(searchName, filters) {
        if (!searchName || !filters) {
            return { success: false, message: 'Search name and filters are required' };
        }

        const search = {
            id: Date.now(),
            name: searchName,
            filters: filters,
            savedAt: new Date().toLocaleString(),
        };

        this.savedSearches.push(search);
        localStorage.setItem('healthFlowSavedSearches', JSON.stringify(this.savedSearches));
        
        return { 
            success: true, 
            message: `Search "${searchName}" saved successfully`,
            search: search 
        };
    }

    /**
     * Load saved searches from localStorage
     */
    loadSavedSearches() {
        try {
            const saved = localStorage.getItem('healthFlowSavedSearches');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved searches:', error);
            return [];
        }
    }

    /**
     * List all saved searches as HTML
     */
    listSavedSearches() {
        if (this.savedSearches.length === 0) {
            return '<p style="color: #999; margin: 0;">No saved searches yet. Save a search to see it here!</p>';
        }

        let html = '<div class="saved-searches-list">';
        html += `<p style="font-weight: 600; margin-bottom: 12px;">Saved Searches (${this.savedSearches.length})</p>`;

        this.savedSearches.forEach(search => {
            const filterStr = Object.entries(search.filters)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');

            html += `
                <div class="saved-search-item" style="
                    background: #f8f9fa;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    padding: 10px;
                    margin-bottom: 8px;
                    font-size: 12px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                        <div style="flex: 1;">
                            <strong style="color: #15696b; display: block; margin-bottom: 4px;">${this.escapeHtml(search.name)}</strong>
                            <small style="color: #666; display: block; margin-bottom: 4px;">${filterStr || 'No filters'}</small>
                            <small style="color: #999;">Saved: ${search.savedAt}</small>
                        </div>
                        <div style="display: flex; gap: 4px;">
                            <button onclick="healthFlowChatbot.loadSearch(${search.id})" style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                padding: 6px 10px;
                                border-radius: 4px;
                                font-size: 11px;
                                cursor: pointer;
                                font-weight: 600;
                                transition: all 0.2s;
                            " title="Load this search">
                                Load
                            </button>
                            <button onclick="healthFlowChatbot.deleteSearch(${search.id})" style="
                                background: #ff6b6b;
                                color: white;
                                border: none;
                                padding: 6px 10px;
                                border-radius: 4px;
                                font-size: 11px;
                                cursor: pointer;
                                font-weight: 600;
                                transition: all 0.2s;
                            " title="Delete this search">
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Load a saved search and execute it
     */
    async loadSearch(searchId) {
        const search = this.savedSearches.find(s => s.id === searchId);
        if (!search) {
            alert('Search not found');
            return;
        }

        // Build a natural language query from filters
        let query = 'Show me ';
        const { filters } = search;

        if (filters.patient_no) query += `patient ${filters.patient_no} `;
        if (filters.status) query += `${filters.status.toLowerCase()} patients `;
        if (filters.hiv_status) query += `with HIV ${filters.hiv_status.toLowerCase()} status `;
        if (filters.condition) query += `with ${filters.condition} `;
        if (filters.viral_load_status) query += `with ${filters.viral_load_status} viral load `;

        if (typeof chatbotUI !== 'undefined') {
            chatbotUI.sendMessage(query);
        }
    }

    /**
     * Delete a saved search
     */
    deleteSearch(searchId) {
        if (!confirm('Are you sure you want to delete this search?')) {
            return;
        }

        this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
        localStorage.setItem('healthFlowSavedSearches', JSON.stringify(this.savedSearches));
        
        if (typeof chatbotUI !== 'undefined') {
            // Refresh the saved searches display
            chatbotUI.showSavedSearches();
        }
    }

    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chatbot globally
const healthFlowChatbot = new HealthFlowChatbot();