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
        patterns: ['show|list|find|get|search|display|give me|find me'],
        keywords: ['patient|patients', 'by|with|has|status|condition|hiv|viral|appointment|age|gender']
      },
      patient_stats: {
        patterns: ['how many|count|total|statistics|stats|summary|overview'],
        keywords: ['patient|patients', 'active|inactive|critical|alert|positive|negative']
      },
      specific_patient: {
        patterns: ['patient|show|details|info|information'],
        keywords: ['patient', '[a-z0-9]+'] // patient ID or number
      },
      appointments: {
        patterns: ['appointment|scheduled|visit|next|upcoming|missed', 'patient|patients'],
        keywords: []
      },
      viral_load: {
        patterns: ['viral|load|viral load|detectable|undetectable'],
        keywords: ['patient|patients', 'high|low|detectable|undetectable']
      },
      high_risk: {
        patterns: ['risk|alert|critical|urgent|concern|monitor'],
        keywords: ['patient|patients']
      }
    };
  }

  /**
   * Process user query and determine intent
   */
  detectIntent(query) {
    const queryLower = query.toLowerCase().trim();
    let detectedIntents = [];

    for (const [intentName, intentData] of Object.entries(this.intents)) {
      const patternMatch = intentData.patterns.some(pattern => 
        new RegExp(pattern).test(queryLower)
      );
      
      const keywordMatch = intentData.keywords.length === 0 || 
        intentData.keywords.some(kw => queryLower.includes(kw));

      if (patternMatch && keywordMatch) {
        detectedIntents.push(intentName);
      }
    }

    return detectedIntents.length > 0 ? detectedIntents[0] : 'general_query';
  }

  /**
   * Extract filter parameters from query
   */
  extractFilters(query) {
    const queryLower = query.toLowerCase();
    const filters = {};

    // Extract patient ID/number
    const patientMatch = query.match(/patient[s]?\s*(?:no\.?|number|#)?[\s]?([A-Za-z0-9]+)/i);
    if (patientMatch) filters.patient_no = patientMatch[1];

    // Extract status
    if (/active|ongoing/i.test(queryLower)) filters.status = 'Active';
    if (/inactive|discharged/i.test(queryLower)) filters.status = 'Inactive';
    if (/critical|alert|urgent/i.test(queryLower)) filters.status = 'Critical';

    // Extract HIV status
    if (/positive|hiv\+|confirmed/i.test(queryLower)) filters.hiv_status = 'Positive';
    if (/negative|hiv\-/i.test(queryLower)) filters.hiv_status = 'Negative';

    // Extract condition
    if (/diabetes|diabetic/i.test(queryLower)) filters.condition = 'Diabetes';
    if (/hypertension|high blood pressure/i.test(queryLower)) filters.condition = 'Hypertension';
    if (/tuberculosis|tb/i.test(queryLower)) filters.condition = 'TB';
    if (/cancer/i.test(queryLower)) filters.condition = 'Cancer';

    // Extract viral load status
    if (/detectable/i.test(queryLower)) filters.viral_load_status = 'Detectable';
    if (/undetectable/i.test(queryLower)) filters.viral_load_status = 'Undetectable';

    // Extract gender
    if (/male|men|boys/i.test(queryLower)) filters.gender = 'M';
    if (/female|women|girls/i.test(queryLower)) filters.gender = 'F';

    // Extract age range
    const ageMatch = queryLower.match(/(?:age|aged|over|above)\s*(\d+)/);
    if (ageMatch) filters.min_age = parseInt(ageMatch[1]);

    return filters;
  }

  /**
   * Query Supabase for patients based on filters
   */
  async queryPatients(filters) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Database connection not available');
      }

      let query = window.supabaseClient.from('patients').select('*');

      // Apply filters
      if (filters.patient_no) {
        query = query.eq('patient_no', filters.patient_no);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.hiv_status) {
        query = query.eq('hiv_status', filters.hiv_status);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.viral_load_status) {
        query = query.eq('viral_load_status', filters.viral_load_status);
      }
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      if (filters.min_age) {
        query = query.gte('age', filters.min_age);
      }

      // Limit results
      query = query.limit(20);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Get statistics based on filters
   */
  async getStatistics(filters) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Database connection not available');
      }

      let query = window.supabaseClient.from('patients').select('*');

      // Apply filters for stats
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.hiv_status) query = query.eq('hiv_status', filters.hiv_status);
      if (filters.condition) query = query.eq('condition', filters.condition);

      const { data, error } = await query;
      if (error) throw error;

      const patients = data || [];
      return {
        total: patients.length,
        byStatus: this.countBy(patients, 'status'),
        byCondition: this.countBy(patients, 'condition'),
        byHIVStatus: this.countBy(patients, 'hiv_status'),
        avgAge: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length) : 0
      };
    } catch (error) {
      console.error('Statistics error:', error);
      throw error;
    }
  }

  /**
   * Utility: count occurrences by field
   */
  countBy(array, field) {
    return array.reduce((acc, obj) => {
      const key = obj[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Format patient data for display
   */
  formatPatientResponse(patients) {
    if (patients.length === 0) {
      return 'No patients found matching your criteria.';
    }

    if (patients.length === 1) {
      const p = patients[0];
      return `
<strong>Patient Found:</strong>
<br/>ID: ${p.patient_no} | Name: ${p.first_name} ${p.last_name}
<br/>Age: ${p.age} | Gender: ${p.gender}
<br/>Status: <span class="badge bg-info">${p.status}</span>
<br/>Condition: ${p.condition || 'N/A'}
<br/>HIV Status: <span class="badge ${p.hiv_status === 'Positive' ? 'bg-danger' : 'bg-success'}">${p.hiv_status || 'Unknown'}</span>
${p.viral_load_status ? `<br/>Viral Load: <span class="badge bg-warning">${p.viral_load_status}</span>` : ''}
${p.next_appointment ? `<br/>Next Appointment: ${new Date(p.next_appointment).toLocaleDateString()}` : ''}
${p.notes ? `<br/>Notes: ${p.notes}` : ''}
      `;
    }

    // Multiple patients - show as table
    let html = `<strong>Found ${patients.length} patients:</strong><br/>
<table class="table table-sm table-striped mt-2">
<thead><tr>
<th>ID</th><th>Name</th><th>Age</th><th>Status</th><th>Condition</th><th>HIV</th>
</tr></thead><tbody>`;

    patients.forEach(p => {
      html += `<tr>
<td>${p.patient_no}</td>
<td>${p.first_name} ${p.last_name}</td>
<td>${p.age}</td>
<td><span class="badge bg-info">${p.status}</span></td>
<td>${p.condition || '—'}</td>
<td><span class="badge ${p.hiv_status === 'Positive' ? 'bg-danger' : 'bg-success'}">${p.hiv_status || '?'}</span></td>
</tr>`;
    });

    html += '</tbody></table>';
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

    html += '<br/><strong>By Condition:</strong><br/>';
    for (const [condition, count] of Object.entries(stats.byCondition)) {
      html += `${condition}: ${count} <br/>`;
    }

    html += '<br/><strong>By HIV Status:</strong><br/>';
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
    
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Detect intent
      const intent = this.detectIntent(userMessage);
      console.log('Detected intent:', intent);

      // Extract filters
      const filters = this.extractFilters(userMessage);
      console.log('Extracted filters:', filters);

      let botResponse = '';

      // Process based on intent
      if (intent === 'patient_search' || intent === 'specific_patient') {
        const patients = await this.queryPatients(filters);
        botResponse = this.formatPatientResponse(patients);
      } else if (intent === 'patient_stats') {
        const stats = await this.getStatistics(filters);
        botResponse = this.formatStatsResponse(stats);
      } else if (intent === 'appointments') {
        const patients = await this.queryPatients({ ...filters });
        const withAppointments = patients.filter(p => p.next_appointment);
        if (withAppointments.length > 0) {
          botResponse = `<strong>Upcoming Appointments (${withAppointments.length}):</strong><br/>`;
          withAppointments.forEach(p => {
            botResponse += `${p.first_name} ${p.last_name} - ${new Date(p.next_appointment).toLocaleDateString()}<br/>`;
          });
        } else {
          botResponse = 'No upcoming appointments found.';
        }
      } else if (intent === 'viral_load') {
        const patients = await this.queryPatients({ ...filters });
        const withViralLoad = patients.filter(p => p.viral_load_status);
        if (withViralLoad.length > 0) {
          botResponse = `<strong>Viral Load Status (${withViralLoad.length} patients):</strong><br/>`;
          withViralLoad.forEach(p => {
            botResponse += `${p.first_name} ${p.last_name}: ${p.viral_load_status}`;
            if (p.viral_load_copies) botResponse += ` (${p.viral_load_copies} copies)`;
            botResponse += '<br/>';
          });
        } else {
          botResponse = 'No viral load data found.';
        }
      } else if (intent === 'high_risk') {
        const patients = await this.queryPatients({ status: 'Critical', ...filters });
        if (patients.length > 0) {
          botResponse = `<strong>High-Risk Patients (${patients.length}):</strong><br/>`;
          botResponse += this.formatPatientResponse(patients);
        } else {
          botResponse = 'No critical patients at this time.';
        }
      } else {
        botResponse = 'I can help you search for patients. Try asking things like:<br/>- "Show me all HIV positive patients"<br/>- "List patients with diabetes"<br/>- "How many active patients do we have?"<br/>- "Show critical patients"';
      }

      // Add bot response to history
      this.conversationHistory.push({
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      });

      // Trim history if too long
      if (this.conversationHistory.length > this.maxMessages) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxMessages);
      }

      return botResponse;
    } catch (error) {
      const errorMessage = `Sorry, I encountered an error: ${error.message}. Please try again.`;
      this.conversationHistory.push({
        role: 'bot',
        content: errorMessage,
        timestamp: new Date()
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
