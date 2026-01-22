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
                 patterns: ["appointment|scheduled|visit|next|upcoming|missed|when|date|week|month|this|between|from|to"],
                 keywords: [
                     "appointment|scheduled|visit|next|upcoming|missed|appointment|date|week|month|this week|next week|next month|this month",
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

         // Stored data for export
         this.lastQueryResults = null;

         // Appointment reminders storage
         this.appointmentReminders = {};
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
             filters.conditionLike = "HIV";
             console.log("Matched HIV/AIDS");
         }
         if (/hypertension|high blood pressure|hbp/i.test(queryLower)) {
             filters.conditionLike = "Hypertension";
             console.log("Matched Hypertension");
         }
         if (/diabetes|diabetic|type 2|t2dm|dm/i.test(queryLower)) {
             filters.conditionLike = "Diabetes";
             console.log("Matched Diabetes");
         }
         if (/tuberculosis|tb(?!\w)/i.test(queryLower)) {
             filters.conditionLike = "TB";
             console.log("Matched TB");
         }
         if (/cancer/i.test(queryLower)) {
             filters.conditionLike = "Cancer";
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

        // Extract provider/staff name
        // Match patterns like: "with doctor John", "by nurse Mary", "provider Sarah", "staff James"
        const providerMatch = query.match(
            /(?:with|by|provider|staff|doctor|nurse|clinician|dr\.?|dr\s|nurse\s)\s+([A-Za-z\s]+?)(?:\s|$|,|\.)/i
        );
        if (providerMatch) {
            filters.provider_name = providerMatch[1].trim();
            console.log("Extracted provider/staff name:", filters.provider_name);
        }

        // Extract appointment date range
        this.extractAppointmentDateRange(queryLower, filters);

        return filters;
    }

    /**
     * Extract appointment date ranges from query
     */
    extractAppointmentDateRange(queryLower, filters) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Try to extract custom date ranges first (e.g., "from Jan 1 to Jan 15", "between 2024-01-01 and 2024-01-31")
        const customRangeMatch = this.extractCustomDateRange(queryLower);
        if (customRangeMatch) {
            filters.appointmentStartDate = customRangeMatch.startDate;
            filters.appointmentEndDate = customRangeMatch.endDate;
            console.log("Extracted custom date range:", {
                startDate: customRangeMatch.startDate.toLocaleDateString(),
                endDate: customRangeMatch.endDate.toLocaleDateString()
            });
            // Still check for missed appointments
            if (/missed|overdue|past|missed appointment/.test(queryLower)) {
                filters.appointmentMissed = true;
            }
            return;
        }

        // This week
        if (/this week|week of/.test(queryLower)) {
            const dayOfWeek = today.getDay();
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - dayOfWeek);
            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6);
            filters.appointmentStartDate = firstDay;
            filters.appointmentEndDate = lastDay;
            console.log("Extracted: this week");
        }
        // Next week
        else if (/next week/.test(queryLower)) {
            const dayOfWeek = today.getDay();
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() + (7 - dayOfWeek));
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
            filters.appointmentStartDate = nextWeekStart;
            filters.appointmentEndDate = nextWeekEnd;
            console.log("Extracted: next week");
        }
        // Next month
        else if (/next month/.test(queryLower)) {
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            const monthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
            const monthEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
            filters.appointmentStartDate = monthStart;
            filters.appointmentEndDate = monthEnd;
            console.log("Extracted: next month");
        }
        // This month
        else if (/this month|month of/.test(queryLower)) {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            filters.appointmentStartDate = monthStart;
            filters.appointmentEndDate = monthEnd;
            console.log("Extracted: this month");
        }
        // Next 7 days
        else if (/next 7 days?|7 days?/.test(queryLower)) {
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
            filters.appointmentStartDate = today;
            filters.appointmentEndDate = endDate;
            console.log("Extracted: next 7 days");
        }
        // Next 30 days
        else if (/next 30 days?|30 days?|last 30 days?/.test(queryLower)) {
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 30);
            filters.appointmentStartDate = today;
            filters.appointmentEndDate = endDate;
            console.log("Extracted: next 30 days");
        }
        // Missed appointments
        if (/missed|overdue|past|missed appointment/.test(queryLower)) {
            filters.appointmentMissed = true;
            console.log("Extracted: missed appointments");
        }
    }

    /**
     * Extract custom date range from query
     * Supports formats like:
     * - "from Jan 1 to Jan 15"
     * - "between 2024-01-01 and 2024-01-31"
     * - "from January 1 2024 to January 31 2024"
     * - "01/01/2024 to 01/31/2024"
     */
    extractCustomDateRange(queryLower) {
        const monthMap = {
            'january': 0, 'jan': 0,
            'february': 1, 'feb': 1,
            'march': 2, 'mar': 2,
            'april': 3, 'apr': 3,
            'may': 4,
            'june': 5, 'jun': 5,
            'july': 6, 'jul': 6,
            'august': 7, 'aug': 7,
            'september': 8, 'sep': 8, 'sept': 8,
            'october': 9, 'oct': 9,
            'november': 10, 'nov': 10,
            'december': 11, 'dec': 11
        };

        // Pattern 1: "from [date] to [date]" - capture month and day numbers
         // Split on " to " word to properly capture both dates
         if (queryLower.includes(' to ')) {
             const parts = queryLower.split(' to ');
             if (parts.length === 2) {
                 let beforeTo = parts[0];
                 let afterTo = parts[1];
                 
                 // Extract start date (after "from")
                 const fromMatch = beforeTo.match(/from\s+(.+)$/);
                 if (fromMatch) {
                     const startStr = fromMatch[1].trim();
                     
                     // Extract end date (before "appointments" or end of string)
                     const endStr = afterTo.replace(/\s+appointments.*$/i, '').trim();
                     
                     console.log("DEBUG: Split pattern matched:", { startStr, endStr });
                     
                     const startDate = this.parseFlexibleDate(startStr, monthMap);
                     const endDate = this.parseFlexibleDate(endStr, monthMap);
                     
                     console.log("DEBUG: Parsed dates from split:", { 
                         startStr, 
                         startDate: startDate ? startDate.toISOString() : null,
                         endStr,
                         endDate: endDate ? endDate.toISOString() : null
                     });
                     
                     if (startDate && endDate) {
                         return { startDate, endDate };
                     }
                 }
             }
         }
         
         // Fallback to old pattern if split method doesn't work
         const betweenPattern = /from\s+(.+?)\s+to\s+(.+?)(?:\s+appointments)?/i;
         const betweenMatch = queryLower.match(betweenPattern);
        
        if (betweenMatch) {
            const startStr = betweenMatch[1].trim();
            const endStr = betweenMatch[2].trim();
            
            console.log("DEBUG: Parsing custom date range:", { startStr, endStr });
            
            const startDate = this.parseFlexibleDate(startStr, monthMap);
            const endDate = this.parseFlexibleDate(endStr, monthMap);
            
            console.log("DEBUG: Parsed dates:", { 
                startStr, 
                startDate: startDate ? startDate.toISOString() : null,
                endStr,
                endDate: endDate ? endDate.toISOString() : null
            });
            
            if (startDate && endDate) {
                return { startDate, endDate };
            }
        }

        // Pattern 2: Date range with slashes "01/01/2024 to 01/31/2024"
        const slashPattern = /(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:to|-|–)\s*(\d{1,2}\/\d{1,2}\/\d{4})/;
        const slashMatch = queryLower.match(slashPattern);
        
        if (slashMatch) {
            const startDate = this.parseSlashDate(slashMatch[1]);
            const endDate = this.parseSlashDate(slashMatch[2]);
            
            if (startDate && endDate) {
                return { startDate, endDate };
            }
        }

        // Pattern 3: ISO format "2024-01-01 to 2024-01-31"
        const isoPattern = /(\d{4}-\d{1,2}-\d{1,2})\s*(?:to|-|–)\s*(\d{4}-\d{1,2}-\d{1,2})/;
        const isoMatch = queryLower.match(isoPattern);
        
        if (isoMatch) {
            // Parse ISO dates and ensure they're in UTC
            const [startYear, startMonth, startDay] = isoMatch[1].split('-').map(Number);
            const [endYear, endMonth, endDay] = isoMatch[2].split('-').map(Number);
            
            const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0, 0));
            const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 0, 0, 0, 0));
            
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                return { startDate, endDate };
            }
        }

        return null;
    }

    /**
     * Parse flexible date format
     * Supports: "Jan 1", "January 1 2024", "1 Jan", "01/01/2024", etc.
     */
    parseFlexibleDate(dateStr, monthMap) {
        dateStr = dateStr.trim().toLowerCase();
        
        console.log("DEBUG: parseFlexibleDate called with:", dateStr);
        
        // Try to extract month, day, and optional year
        // Pattern: "month day [year]" or "day month [year]" or "month day, year"
        
        // Try format: "Jan 1" or "January 1" or "Jan 1 2024"
        const monthDayPattern = /^([a-z]+)\s+(\d{1,2})(?:\s+(\d{4}))?$/;
        const monthDayMatch = dateStr.match(monthDayPattern);
        
        if (monthDayMatch) {
            const monthStr = monthDayMatch[1];
            const day = parseInt(monthDayMatch[2]);
            const year = monthDayMatch[3] ? parseInt(monthDayMatch[3]) : new Date().getFullYear();
            
            const month = monthMap[monthStr];
            console.log("DEBUG: Month-Day match:", { monthStr, month, day, year });
            
            if (month !== undefined && day >= 1 && day <= 31) {
                // Create date in UTC to avoid timezone issues
                const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
                console.log("DEBUG: Created date:", date.toISOString());
                return date;
            }
        }

        // Try format: "1 Jan" or "1 January" or "1 Jan 2024"
        const dayMonthPattern = /^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/;
        const dayMonthMatch = dateStr.match(dayMonthPattern);
        
        if (dayMonthMatch) {
            const day = parseInt(dayMonthMatch[1]);
            const monthStr = dayMonthMatch[2];
            const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3]) : new Date().getFullYear();
            
            const month = monthMap[monthStr];
            if (month !== undefined && day >= 1 && day <= 31) {
                // Create date in UTC to avoid timezone issues
                const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
                return date;
            }
        }

        // Try MM/DD/YYYY or MM/DD
        const slashPattern = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/;
        const slashMatch = dateStr.match(slashPattern);
        
        if (slashMatch) {
            const month = parseInt(slashMatch[1]) - 1;
            const day = parseInt(slashMatch[2]);
            const year = slashMatch[3] ? parseInt(slashMatch[3]) : new Date().getFullYear();
            
            if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                // Create date in UTC to avoid timezone issues
                const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
                return date;
            }
        }

        return null;
    }

    /**
     * Parse date in slash format MM/DD/YYYY
     */
    parseSlashDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const month = parseInt(parts[0]) - 1;
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            
            if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1900) {
                const date = new Date(year, month, day);
                date.setHours(0, 0, 0, 0);
                return date;
            }
        }
        return null;
    }

    /**
     * Query appointments with date filtering (using next_appointment from patients table)
     */
    async queryAppointments(filters) {
         try {
             if (!window.supabaseClient) {
                 throw new Error("Database connection not available.");
             }

             const session = JSON.parse(localStorage.getItem('userSession') || '{}');
             const facilityId = session.fid || session.facility_id;

             if (!facilityId) {
                 throw new Error("No facility ID found. Please log in again.");
             }

             let query = window.supabaseClient
                 .from("patients")
                 .select("*");

             // Filter by facility
             query = query.eq("fid", facilityId);

             // Apply patient filters
             if (filters.patient_no) {
                 query = query.eq("patient_no", filters.patient_no);
             }
             if (filters.status) {
                 query = query.eq("status", filters.status);
             }
             if (filters.hiv_status) {
                 query = query.eq("hiv_status", filters.hiv_status);
             }
             if (filters.conditionLike) {
                 query = query.ilike("condition", `%${filters.conditionLike}%`);
             } else if (filters.condition) {
                 query = query.eq("condition", filters.condition);
             }
             if (filters.gender) {
                 query = query.eq("gender", filters.gender);
             }
             if (filters.min_age) {
                 query = query.gte("age", filters.min_age);
             }

             query = query.limit(50);

             const { data: patients, error } = await query;

             if (error) {
                 console.error("Appointment query error:", error);
                 throw error;
             }

             // Filter appointments by next_appointment date range from patients table
              let allAppointments = [];
              
              // Log filter dates for debugging
              if (filters.appointmentStartDate || filters.appointmentEndDate) {
                  console.log("DEBUG: Appointment date filter applied:");
                  console.log("  Start Date:", filters.appointmentStartDate ? filters.appointmentStartDate.toISOString() : "None");
                  console.log("  End Date:", filters.appointmentEndDate ? filters.appointmentEndDate.toISOString() : "None");
              }
              
              patients.forEach(patient => {
                  // Check if patient has a next_appointment scheduled
                  if (patient.next_appointment) {
                      const apptDate = new Date(patient.next_appointment);
                      // Normalize appointment date to midnight UTC for proper comparison
                      const apptDateNormalized = new Date(Date.UTC(
                          apptDate.getUTCFullYear(),
                          apptDate.getUTCMonth(),
                          apptDate.getUTCDate(),
                          0, 0, 0, 0
                      ));
                      let include = true;
                      let debugInfo = {
                          patientName: `${patient.first_name} ${patient.last_name}`,
                          apptDateRaw: patient.next_appointment,
                          apptDateNormalized: apptDateNormalized.toISOString()
                      };

                      // Check date range
                       if (filters.appointmentStartDate) {
                           const passesStart = apptDateNormalized >= filters.appointmentStartDate;
                           include = include && passesStart;
                           debugInfo.startDate = filters.appointmentStartDate.toISOString();
                           debugInfo.passesStart = passesStart;
                       }
                       if (filters.appointmentEndDate) {
                           // End date should include the entire day
                           // Create end-of-day boundary: next day at midnight UTC (00:00:00)
                           const endDate = filters.appointmentEndDate;
                           const nextDayMidnight = new Date(Date.UTC(
                               endDate.getUTCFullYear(),
                               endDate.getUTCMonth(),
                               endDate.getUTCDate() + 1,
                               0, 0, 0, 0
                           ));
                           const passesEnd = apptDateNormalized < nextDayMidnight;
                           include = include && passesEnd;
                           debugInfo.endDate = endDate.toISOString();
                           debugInfo.endBoundary = nextDayMidnight.toISOString();
                           debugInfo.passesEnd = passesEnd;
                           debugInfo.comparison = `${apptDateNormalized.toISOString()} < ${nextDayMidnight.toISOString()} = ${passesEnd}`;
                       }

                      // Check if missed (appointment date in past)
                      if (filters.appointmentMissed) {
                          const now = new Date();
                          now.setHours(0, 0, 0, 0);
                          include = include && apptDate < now;
                      }

                      // Apply provider filter if specified
                      if (filters.provider_name && patient.provider_name) {
                          include = include && patient.provider_name.toLowerCase().includes(filters.provider_name.toLowerCase());
                      }

                      if (include) {
                          console.log("DEBUG: Including appointment:", debugInfo);
                          allAppointments.push({
                              id: patient.id,
                              patient_id: patient.id,
                              patient_name: `${patient.first_name} ${patient.last_name}`,
                              patient_no: patient.patient_no,
                              appointment_date: patient.next_appointment,
                              next_appointment: patient.next_appointment,
                              status: patient.status,
                              provider_name: patient.provider_name || patient.staff_name || "—",
                              notes: patient.notes,
                              appointment_type: patient.appointment_type || "Regular"
                          });
                      } else if (filters.appointmentStartDate || filters.appointmentEndDate) {
                          console.log("DEBUG: Excluding appointment:", debugInfo);
                      }
                      }
                      });

             // Sort by appointment date
             allAppointments.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

             console.log(`Found ${allAppointments.length} appointments within date range`);

             // Store for export
             this.lastQueryResults = allAppointments;

             return allAppointments;
        } catch (error) {
            console.error("Error querying appointments:", error);
            throw error;
        }
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

         // Get facility ID from session
          const session = JSON.parse(localStorage.getItem('userSession') || '{}');
          const facilityId = session.fid || session.facility_id;

         if (!facilityId) {
           throw new Error(
             "No facility ID found. Please log in again."
           );
         }

         console.log("Querying patients for facility:", facilityId);

         let query = window.supabaseClient.from("patients").select("*");
        
        // Filter by facility - ALWAYS apply this filter first
        query = query.eq("fid", facilityId);

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
            if (filters.conditionLike) {
                query = query.ilike("condition", `%${filters.conditionLike}%`);
            } else if (filters.condition) {
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

            // Get facility ID from session
            const session = JSON.parse(localStorage.getItem('healthflow_session') || '{}');
            const facilityId = session.fid || session.facility_id;

            if (!facilityId) {
                throw new Error("No facility ID found. Please log in again.");
            }

            let query = window.supabaseClient.from("patients").select("*");
            
            // Filter by facility first
            query = query.eq("fid", facilityId);

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
     * Get current facility information from session
     */
    getCurrentFacility() {
      try {
        const session = JSON.parse(localStorage.getItem('healthflow_session') || '{}');
        return {
          id: session.fid || session.facility_id,
          name: session.facilityName || 'Unknown Facility',
          userRole: session.userRole || 'Unknown'
        };
      } catch (error) {
        console.error("Error getting facility info:", error);
        return null;
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
     * Format appointment data for display
     */
    formatAppointmentResponse(appointments) {
         if (appointments.length === 0) {
             return "No appointments found for the specified criteria.";
         }

         let html = `<strong>Appointments Found: ${appointments.length}</strong><br/>
     <table class="table table-sm table-striped mt-2">
     <thead><tr>
     <th>Date</th><th>Patient</th><th>Provider/Staff</th><th>Status</th><th>Type</th><th>Next Appt</th><th>Notes</th>
     </tr></thead><tbody>`;

         appointments.forEach((appt) => {
             const apptDate = new Date(appt.appointment_date).toLocaleDateString();
             const nextApptDate = appt.next_appointment ? new Date(appt.next_appointment).toLocaleDateString() : "—";
             const statusBadgeColor = 
                 appt.status === "Completed" ? "bg-success" :
                 appt.status === "Missed" ? "bg-danger" :
                 appt.status === "Scheduled" ? "bg-info" : "bg-warning";
             const providerName = appt.provider_name || appt.staff_name || "—";

             html += `<tr>
     <td>${apptDate}</td>
     <td>${appt.patient_name} (${appt.patient_no})</td>
     <td>${providerName}</td>
     <td><span class="badge ${statusBadgeColor}">${appt.status || "Scheduled"}</span></td>
     <td>${appt.appointment_type || "Regular"}</td>
     <td>${nextApptDate}</td>
     <td>${appt.notes || "—"}</td>
     </tr>`;
         });

         html += `</tbody></table>
     <div style="margin-top: 12px; font-size: 12px; color: #666;">
     <button onclick="healthFlowChatbot.exportAppointmentsToExcel()" class="btn btn-sm btn-outline-primary">📊 Export to Excel</button>
     <button onclick="healthFlowChatbot.exportAppointmentsToPDF()" class="btn btn-sm btn-outline-primary" style="margin-left: 8px;">📄 Export to PDF</button>
     <button onclick="chatbotUI.setReminderForAll('notification', 1)" class="btn btn-sm btn-warning" style="margin-left: 8px;">🔔 Set 1-Min Reminders (Test)</button>
     </div>`;

         return html;
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
        <th>ID</th><th>Name</th><th>Age</th><th>Status</th><th>Condition</th><th>HIV</th><th>Next Appt</th><th>Appt Type</th>
        </tr></thead><tbody>`;

         patients.forEach((p) => {
             const nextApptDate = p.next_appointment ? new Date(p.next_appointment).toLocaleDateString() : "—";
             const appointmentType = p.appointment_type || "—";
             html += `<tr>
         <td>${p.patient_no}</td>
         <td>${p.first_name} ${p.last_name}</td>
         <td>${p.age}</td>
         <td><span class="badge bg-info">${p.status}</span></td>
         <td>${p.condition || "—"}</td>
         <td><span class="badge ${
         p.hiv_status === "Positive" ? "bg-danger" : "bg-success"
         }">${p.hiv_status || "?"}</span></td>
         <td>${nextApptDate}</td>
         <td>${appointmentType}</td>
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
                     console.log("Querying appointments with filters:", {
                         ...filters,
                         startDate: filters.appointmentStartDate ? filters.appointmentStartDate.toLocaleDateString() : null,
                         endDate: filters.appointmentEndDate ? filters.appointmentEndDate.toLocaleDateString() : null
                     });
                     const appointments = await this.queryAppointments(filters);
                     console.log(`Found ${appointments.length} appointments`);
                     botResponse = this.formatAppointmentResponse(appointments);
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

    /**
     * Export appointments to Excel
     */
    exportAppointmentsToExcel() {
        if (!this.lastQueryResults || this.lastQueryResults.length === 0) {
            alert('No data to export');
            return;
        }

        // Use advanced Excel exporter if available
        if (typeof advancedChatbotFeatures !== 'undefined' && 
            advancedChatbotFeatures.excelExporter) {
            advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(
                this.lastQueryResults
            );
            return;
        }

        // Fallback: Create CSV content
         const appointments = this.lastQueryResults;
         let csv = 'Date,Patient ID,Patient Name,Status,Type,Next Appointment,Notes\n';
         
         appointments.forEach(appt => {
             const date = new Date(appt.appointment_date).toLocaleDateString();
             const nextAppt = appt.next_appointment ? new Date(appt.next_appointment).toLocaleDateString() : '';
             const row = [
                 date,
                 appt.patient_no,
                 appt.patient_name,
                 appt.status || 'Scheduled',
                 appt.appointment_type || 'Regular',
                 nextAppt,
                 (appt.notes || '').replace(/"/g, '""')
             ];
             csv += `"${row.join('","')}"\n`;
         });

        // Download as CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `appointments_export_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export appointments to PDF
     */
    exportAppointmentsToPDF() {
        if (!this.lastQueryResults || this.lastQueryResults.length === 0) {
            alert('No data to export');
            return;
        }

        const appointments = this.lastQueryResults;
        
        // Check if jsPDF is available, otherwise generate a table-based HTML to print
        if (typeof window.jsPDF !== 'undefined') {
            this.exportToPDFWithLibrary(appointments);
        } else {
            this.exportToPDFViaHTML(appointments);
        }
    }

    /**
     * Export to PDF using jsPDF library (if available)
     */
    exportToPDFWithLibrary(appointments) {
        const { jsPDF } = window;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(16);
        doc.text('Appointments Report', 14, 22);
        
        // Date generated
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
        
        // Table data
         const tableData = appointments.map(appt => [
             new Date(appt.appointment_date).toLocaleDateString(),
             appt.patient_no,
             appt.patient_name,
             appt.status || 'Scheduled',
             appt.appointment_type || 'Regular',
             appt.next_appointment ? new Date(appt.next_appointment).toLocaleDateString() : '',
             (appt.notes || '').substring(0, 30)
         ]);
         
         // Add table
         doc.autoTable({
             head: [['Date', 'Patient ID', 'Patient Name', 'Status', 'Type', 'Next Appt', 'Notes']],
             body: tableData,
             startY: 36
         });
        
        // Save PDF
        doc.save(`appointments_export_${new Date().getTime()}.pdf`);
    }

    /**
     * Export to PDF via HTML print (fallback)
     */
    exportToPDFViaHTML(appointments) {
        let html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .metadata { color: #666; font-size: 12px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #333; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>Appointments Report</h1>
            <div class="metadata">Generated: ${new Date().toLocaleString()}</div>
            <div>Total Appointments: ${appointments.length}</div>
            <table>
                 <thead>
                     <tr>
                         <th>Date</th>
                         <th>Patient ID</th>
                         <th>Patient Name</th>
                         <th>Status</th>
                         <th>Type</th>
                         <th>Next Appointment</th>
                         <th>Notes</th>
                     </tr>
                 </thead>
                 <tbody>
            `;
            
            appointments.forEach(appt => {
             const nextApptDate = appt.next_appointment ? new Date(appt.next_appointment).toLocaleDateString() : '—';
             html += `
                     <tr>
                         <td>${new Date(appt.appointment_date).toLocaleDateString()}</td>
                         <td>${appt.patient_no}</td>
                         <td>${appt.patient_name}</td>
                         <td>${appt.status || 'Scheduled'}</td>
                         <td>${appt.appointment_type || 'Regular'}</td>
                         <td>${nextApptDate}</td>
                         <td>${appt.notes || ''}</td>
                     </tr>
             `;
            });
        
        html += `
                </tbody>
            </table>
        </body>
        </html>
        `;
        
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        }

        /**
        * Generate appointment statistics for export
        */
        generateAppointmentStatistics(appointments) {
        const stats = {
            total: appointments.length,
            completed: 0,
            scheduled: 0,
            missed: 0,
            cancelled: 0,
            byStatus: {},
            byType: {},
            completionRate: 0,
            missedRate: 0,
            averagePatientAge: 0,
            dateRange: {
                earliest: null,
                latest: null
            }
        };

        let totalAge = 0;
        let patientsWithAge = 0;

        appointments.forEach(appt => {
            const status = appt.status || 'Scheduled';
            
            // Count by status
            if (status === 'Completed') stats.completed++;
            else if (status === 'Scheduled') stats.scheduled++;
            else if (status === 'Missed') stats.missed++;
            else if (status === 'Cancelled') stats.cancelled++;

            // Track status counts
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Track appointment type
            const type = appt.appointment_type || 'Regular';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Track date range
            const apptDate = new Date(appt.appointment_date);
            if (!stats.dateRange.earliest || apptDate < stats.dateRange.earliest) {
                stats.dateRange.earliest = apptDate;
            }
            if (!stats.dateRange.latest || apptDate > stats.dateRange.latest) {
                stats.dateRange.latest = apptDate;
            }
        });

        // Calculate rates
        if (stats.total > 0) {
            stats.completionRate = ((stats.completed / stats.total) * 100).toFixed(1);
            stats.missedRate = ((stats.missed / stats.total) * 100).toFixed(1);
        }

        return stats;
        }

        /**
        * Export appointments with statistics and enhanced formatting
        */
        exportAppointmentsWithStats(format = 'excel') {
        if (!this.lastQueryResults || this.lastQueryResults.length === 0) {
            alert('No data to export');
            return;
        }

        // Use advanced Excel exporter if available
        if (typeof advancedChatbotFeatures !== 'undefined' && 
            advancedChatbotFeatures.excelExporter &&
            format === 'excel') {
            advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(
                this.lastQueryResults
            );
            return;
        }

        const appointments = this.lastQueryResults;
        const stats = this.generateAppointmentStatistics(appointments);

        if (format === 'excel') {
            this.exportToExcelWithStats(appointments, stats);
        } else if (format === 'pdf') {
            this.exportToPDFWithStats(appointments, stats);
        }
        }

        /**
        * Export to Excel with formatting and statistics
        */
        exportToExcelWithStats(appointments, stats) {
        let html = `
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body>
            <table border="1">
                <tr>
                    <td colspan="6" style="background-color: #1e3a8a; color: white; font-weight: bold; padding: 10px; font-size: 16px;">
                        APPOINTMENTS REPORT - ${new Date().toLocaleDateString()}
                    </td>
                </tr>
                <tr>
                    <td colspan="6" style="background-color: #e0e7ff; padding: 8px;">
                        <strong>Report Statistics:</strong> Total: ${stats.total} | Completed: ${stats.completed} | Scheduled: ${stats.scheduled} | Missed: ${stats.missed} | Completion Rate: ${stats.completionRate}%
                    </td>
                </tr>
                <tr style="background-color: #3b82f6; color: white; font-weight: bold;">
                    <td style="padding: 8px;">Date</td>
                    <td style="padding: 8px;">Patient ID</td>
                    <td style="padding: 8px;">Patient Name</td>
                    <td style="padding: 8px;">Status</td>
                    <td style="padding: 8px;">Type</td>
                    <td style="padding: 8px;">Notes</td>
                </tr>`;

        appointments.forEach((appt, index) => {
            const rowBgColor = index % 2 === 0 ? '#ffffff' : '#f3f4f6';
            const statusColor = 
                appt.status === 'Completed' ? '#10b981' :
                appt.status === 'Missed' ? '#ef4444' :
                appt.status === 'Scheduled' ? '#3b82f6' : '#f59e0b';

            html += `
                <tr style="background-color: ${rowBgColor};">
                    <td style="padding: 8px;">${new Date(appt.appointment_date).toLocaleDateString()}</td>
                    <td style="padding: 8px;">${appt.patient_no}</td>
                    <td style="padding: 8px;">${appt.patient_name}</td>
                    <td style="padding: 8px; background-color: ${statusColor}; color: white; font-weight: bold;">${appt.status || 'Scheduled'}</td>
                    <td style="padding: 8px;">${appt.appointment_type || 'Regular'}</td>
                    <td style="padding: 8px;">${appt.notes || ''}</td>
                </tr>`;
        });

        html += `
                <tr style="background-color: #f3f4f6; font-weight: bold;">
                    <td colspan="6" style="padding: 10px; border-top: 2px solid #1e3a8a;">
                        Statistics Summary
                    </td>
                </tr>`;

        // Add statistics rows
        for (const [status, count] of Object.entries(stats.byStatus)) {
            html += `
                <tr style="background-color: #ffffff;">
                    <td colspan="2" style="padding: 8px;">Appointments by Status: ${status}</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">${count}</td>
                    <td colspan="3"></td>
                </tr>`;
        }

        html += `
                <tr style="background-color: #e0e7ff;">
                    <td colspan="2" style="padding: 8px;">Completion Rate</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">${stats.completionRate}%</td>
                    <td colspan="3"></td>
                </tr>
                <tr style="background-color: #fee2e2;">
                    <td colspan="2" style="padding: 8px;">Missed Appointment Rate</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">${stats.missedRate}%</td>
                    <td colspan="3"></td>
                </tr>
            </table>
        </body>
        </html>`;

        // Create and download as Excel-compatible file
        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `appointments_report_${new Date().getTime()}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        }

        /**
        * Export to PDF with statistics
        */
        exportToPDFWithStats(appointments, stats) {
        let html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #1e3a8a; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; }
                .stats-box { background-color: #e0e7ff; padding: 15px; margin-bottom: 20px; border-left: 4px solid #3b82f6; }
                .stats-box p { margin: 5px 0; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; font-weight: bold; }
                td { padding: 8px; border-bottom: 1px solid #ddd; }
                tr:nth-child(even) { background-color: #f3f4f6; }
                .status-completed { color: green; font-weight: bold; }
                .status-missed { color: red; font-weight: bold; }
                .status-scheduled { color: blue; font-weight: bold; }
                .stat-summary { background-color: #f3f4f6; margin-top: 20px; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Appointments Report</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            <div class="stats-box">
                <p><strong>Total Appointments:</strong> ${stats.total}</p>
                <p><strong>Completed:</strong> ${stats.completed} | <strong>Scheduled:</strong> ${stats.scheduled} | <strong>Missed:</strong> ${stats.missed}</p>
                <p><strong>Completion Rate:</strong> ${stats.completionRate}% | <strong>Missed Rate:</strong> ${stats.missedRate}%</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Patient ID</th>
                        <th>Patient Name</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>`;

        appointments.forEach(appt => {
            const statusClass = 
                appt.status === 'Completed' ? 'status-completed' :
                appt.status === 'Missed' ? 'status-missed' :
                appt.status === 'Scheduled' ? 'status-scheduled' : '';

            html += `
                    <tr>
                        <td>${new Date(appt.appointment_date).toLocaleDateString()}</td>
                        <td>${appt.patient_no}</td>
                        <td>${appt.patient_name}</td>
                        <td class="${statusClass}">${appt.status || 'Scheduled'}</td>
                        <td>${appt.appointment_type || 'Regular'}</td>
                        <td>${appt.notes || ''}</td>
                    </tr>`;
        });

        html += `
                </tbody>
            </table>
            <div class="stat-summary">
                <h3>Summary Statistics</h3>`;

        for (const [status, count] of Object.entries(stats.byStatus)) {
            html += `<p><strong>${status}:</strong> ${count} appointments</p>`;
        }

        html += `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ccc;">
                    <strong>Report Type:</strong> Appointment Analytics<br>
                    <strong>Generated:</strong> ${new Date().toLocaleString()}
                </p>
            </div>
        </body>
        </html>`;

        const printWindow = window.open('', '', 'height=600,width=900');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        }

        /**
        * Update appointment status via chatbot
        */
        async updateAppointmentStatus(appointmentId, newStatus) {
        try {
            if (!window.supabaseClient) {
                throw new Error("Database connection not available.");
            }

            const { data, error } = await window.supabaseClient
                .from('appointments')
                .update({ status: newStatus })
                .eq('id', appointmentId);

            if (error) {
                console.error("Error updating appointment:", error);
                throw error;
            }

            return { success: true, data };
        } catch (error) {
            console.error("Failed to update appointment status:", error);
            throw error;
        }
        }

        /**
        * Handle bulk appointment operations
        */
        async bulkUpdateAppointmentStatus(appointmentIds, newStatus) {
        try {
            if (!window.supabaseClient) {
                throw new Error("Database connection not available.");
            }

            const updates = appointmentIds.map(id => ({
                id,
                status: newStatus
            }));

            const { data, error } = await window.supabaseClient
                .from('appointments')
                .upsert(updates);

            if (error) {
                console.error("Error bulk updating appointments:", error);
                throw error;
            }

            return {
                success: true,
                updatedCount: appointmentIds.length,
                data
            };
        } catch (error) {
            console.error("Failed to bulk update appointments:", error);
            throw error;
        }
        }

        /**
        * Create appointment reminder
        */
        createAppointmentReminder(appointmentId, reminderType = 'email', minutesBefore = 1440) {
        const reminderId = `reminder_${appointmentId}_${new Date().getTime()}`;
        
        this.appointmentReminders[reminderId] = {
            appointmentId,
            reminderType, // 'email', 'sms', 'notification'
            minutesBefore,
            createdAt: new Date(),
            status: 'active'
        };

        // Schedule the reminder
        this.scheduleReminder(appointmentId, minutesBefore);

        return {
            success: true,
            reminderId,
            message: `Reminder set: ${reminderType} reminder will be sent ${minutesBefore} minutes before appointment`
        };
        }

        /**
        * Schedule appointment reminder
        */
        scheduleReminder(appointmentId, minutesBefore) {
        // Get appointment from last query results
        if (!this.lastQueryResults) return;

        const appointment = this.lastQueryResults.find(a => a.id === appointmentId);
        if (!appointment) return;

        const appointmentTime = new Date(appointment.appointment_date).getTime();
        const reminderTime = appointmentTime - (minutesBefore * 60 * 1000);
        const now = new Date().getTime();
        const delayMs = reminderTime - now;

        if (delayMs > 0) {
            setTimeout(() => {
                console.log(`Reminder triggered for appointment: ${appointmentId}`);
                this.sendReminder(appointment);
            }, delayMs);
        }
        }

        /**
        * Send appointment reminder
        */
        sendReminder(appointment) {
        // In production, this would integrate with email/SMS services
        const reminder = {
            patientName: appointment.patient_name,
            appointmentDate: new Date(appointment.appointment_date).toLocaleString(),
            appointmentType: appointment.appointment_type,
            message: `Reminder: You have an appointment on ${new Date(appointment.appointment_date).toLocaleDateString()}`
        };

        console.log("Sending reminder:", reminder);

        // Could integrate with email service or push notifications
        // Example: await emailService.send(patient.email, reminder);
        }

        /**
        * Get appointment reminders
        */
        getAppointmentReminders(appointmentId = null) {
        if (appointmentId) {
            return Object.values(this.appointmentReminders).filter(
                r => r.appointmentId === appointmentId
            );
        }
        return Object.values(this.appointmentReminders);
        }

        /**
        * Cancel appointment reminder
        */
        cancelAppointmentReminder(reminderId) {
        if (this.appointmentReminders[reminderId]) {
            this.appointmentReminders[reminderId].status = 'cancelled';
            return { success: true, message: 'Reminder cancelled' };
        }
        return { success: false, message: 'Reminder not found' };
        }

        /**
        * Process bulk appointment commands
        */
        async processBulkAppointmentCommand(command, filters) {
        try {
            let appointments = this.lastQueryResults || [];

            if (command.includes('mark as completed')) {
                const result = await this.bulkUpdateAppointmentStatus(
                    appointments.map(a => a.id),
                    'Completed'
                );
                return `✓ Marked ${result.updatedCount} appointments as completed`;
            } else if (command.includes('mark as missed')) {
                const result = await this.bulkUpdateAppointmentStatus(
                    appointments.map(a => a.id),
                    'Missed'
                );
                return `✓ Marked ${result.updatedCount} appointments as missed`;
            } else if (command.includes('cancel')) {
                const result = await this.bulkUpdateAppointmentStatus(
                    appointments.map(a => a.id),
                    'Cancelled'
                );
                return `✓ Cancelled ${result.updatedCount} appointments`;
            } else if (command.includes('set reminder')) {
                let reminderCount = 0;
                appointments.forEach(appt => {
                    this.createAppointmentReminder(appt.id, 'email', 1440);
                    reminderCount++;
                });
                return `✓ Set reminders for ${reminderCount} appointments`;
            }

            return 'Command not recognized for bulk operations';
        } catch (error) {
            return `Error processing bulk operation: ${error.message}`;
        }
        }
        }

        // Initialize chatbot globally
        const healthFlowChatbot = new HealthFlowChatbot();