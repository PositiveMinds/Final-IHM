/**
 * Professional AI Chatbot with Natural Language Processing
 * Retrieves patient data from Supabase based on user queries
 */

class HealthFlowChatbot {
    constructor() {
        this.conversationHistory = [];
        this.isLoading = false;
        this.maxMessages = 50; // Limit conversation history

        // Intent patterns for NLP
        this.intents = {
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
                keywords: ["patient|patients"],
            },
            specific_patient: {
                patterns: ["patient|show|details|info|information"],
                keywords: [], // Only match if we can extract an actual patient ID
            },
            appointments: {
                patterns: ["appointment|scheduled|visit|next|upcoming|missed|when"],
                keywords: [
                    "appointment|scheduled|visit|next|upcoming|missed|appointment",
                ],
            },
            viral_load: {
                patterns: ["viral|load|detectable|undetectable|hiv copies|vl"],
                keywords: ["viral|detectable|undetectable|load|copies"],
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
                intentData.keywords.some((kw) => queryLower.includes(kw));

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
        if (/hiv|aids/i.test(queryLower)) {
            filters.condition = "HIV/AIDS";
            console.log("Matched HIV/AIDS");
        }
        if (/hypertension|high blood pressure|hbp/i.test(queryLower)) {
            filters.condition = "Hypertension";
            console.log("Matched Hypertension");
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

        // Extract viral load status
        if (/detectable/i.test(queryLower))
            filters.viral_load_status = "Detectable";
        if (/undetectable/i.test(queryLower))
            filters.viral_load_status = "Undetectable";

        // Extract gender
        if (/\bmale\b|\bmen\b|\bboys\b/i.test(queryLower)) filters.gender = "M";
        if (/\bfemale\b|\bwomen\b|\bgirls\b/i.test(queryLower))
            filters.gender = "F";

        // Extract age range
        const ageMatch = queryLower.match(
            /(?:age|aged|over|above|older than)\s*(\d+)/
        );
        if (ageMatch) filters.min_age = parseInt(ageMatch[1]);

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
                query = query.eq("condition", filters.condition);
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
            return "No patients found matching your criteria.";
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
            // If specific_patient intent but no patient_no extracted, treat as patient_search
            if (detectedIntent === "specific_patient" && !filters.patient_no) {
                detectedIntent = "patient_search";
            }

            if (
                detectedIntent === "patient_search" ||
                detectedIntent === "specific_patient"
            ) {
                try {
                    const patients = await this.queryPatients(filters);
                    console.log("Patients found:", patients);
                    if (patients.length === 0 && Object.keys(filters).length === 0) {
                        // No filters applied and no results, try to fetch all patients
                        const allPatients = await this.queryPatients({});
                        botResponse = this.formatPatientResponse(allPatients);
                    } else {
                        botResponse = this.formatPatientResponse(patients);
                    }
                } catch (error) {
                    console.error("Error fetching patients:", error);
                    botResponse = `Error retrieving patient data: ${error.message}. Please check the database connection.`;
                }
            } else if (detectedIntent === "patient_stats") {
                try {
                    const stats = await this.getStatistics(filters);
                    botResponse = this.formatStatsResponse(stats);
                } catch (error) {
                    console.error("Error fetching statistics:", error);
                    botResponse = `Error retrieving statistics: ${error.message}. Please check the database connection.`;
                }
            } else if (detectedIntent === "appointments") {
                try {
                    const patients = await this.queryPatients({
                        ...filters
                    });
                    const withAppointments = patients.filter((p) => p.next_appointment);
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
                }
            } else if (detectedIntent === "viral_load") {
                try {
                    const patients = await this.queryPatients({
                        ...filters
                    });
                    const withViralLoad = patients.filter((p) => p.viral_load_status);
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
                }
            } else if (detectedIntent === "high_risk") {
                try {
                    const patients = await this.queryPatients({
                        status: "Critical",
                        ...filters,
                    });
                    if (patients.length > 0) {
                        botResponse = `<strong>High-Risk Patients (${patients.length}):</strong><br/>`;
                        botResponse += this.formatPatientResponse(patients);
                    } else {
                        botResponse = "No critical patients at this time.";
                    }
                } catch (error) {
                    console.error("Error fetching high-risk patients:", error);
                    botResponse = `Error retrieving high-risk patients: ${error.message}`;
                }
            } else {
                botResponse =
                    'I can help you search for patients. Try asking things like:<br/>- "Show me all HIV positive patients"<br/>- "List patients with diabetes"<br/>- "How many active patients do we have?"<br/>- "Show critical patients"';
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
}

// Initialize chatbot globally
const healthFlowChatbot = new HealthFlowChatbot();