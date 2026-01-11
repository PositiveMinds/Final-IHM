// Chatbot Handler - Dashboard Intelligent Chatbot
// Integrates with Supabase Edge Functions

class FacilityChatbot {
  constructor() {
    this.isOpen = false;
    this.sessionData = JSON.parse(localStorage.getItem('healthflow_session'));
    // Use fid (numeric facility ID) from session - it's set by login.js
    this.facilityId = this.sessionData?.fid;
    
    if (!this.facilityId) {
      console.warn('Chatbot: No facility ID found in session');
    } else {
      console.log('Chatbot initialized for facility:', this.facilityId);
    }
    
    this.init();
  }

  init() {
    this.createChatbotUI();
    this.attachEventListeners();
  }

  createChatbotUI() {
    // Create chatbot HTML
    const chatbotHTML = `
      <!-- Chatbot Floating Button & Modal -->
      <div id="chatbot-container">
        <!-- Floating Button -->
        <button id="chatbot-toggle-btn" class="chatbot-floating-btn" title="Ask about patients">
          <i class="ri-chat-3-line"></i>
          <span class="chatbot-badge">AI</span>
        </button>

        <!-- Chatbot Modal -->
        <div id="chatbot-modal" class="chatbot-modal hidden">
          <!-- Header -->
          <div class="chatbot-header">
            <div class="chatbot-title-section">
              <h3>Facility Assistant</h3>
              <p>Ask about your patients</p>
            </div>
            <button id="chatbot-close-btn" class="chatbot-close-btn">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <!-- Chat Messages Area -->
          <div id="chatbot-messages" class="chatbot-messages">
            <div class="chatbot-message bot-message">
              <p>Hello 👋 I'm your facility assistant. Ask me about:</p>
              <ul style="margin: 10px 0; font-size: 0.9em; line-height: 1.6;">
                <li><strong>HIV Care:</strong> Appointments, ART, Viral loads, CD4</li>
                <li><strong>NCDs:</strong> Hypertension, Diabetes, Asthma, Cancer, Heart disease</li>
                <li><strong>Follow-up:</strong> Missed appointments, Due for testing</li>
                <li><strong>Maternal:</strong> Antenatal, Postnatal, Complications</li>
                <li><strong>Other:</strong> Bleeding, Poor adherence, Lab tests due</li>
              </ul>
            </div>
          </div>

          <!-- Input Area -->
          <div class="chatbot-input-area">
            <input 
              type="text" 
              id="chatbot-input" 
              class="chatbot-input" 
              placeholder="Ask about your patients..."
              autocomplete="off"
            >
            <button id="chatbot-send-btn" class="chatbot-send-btn">
              <i class="ri-send-plane-fill"></i>
            </button>
          </div>

          <!-- Loading Indicator -->
          <div id="chatbot-loading" class="chatbot-loading hidden">
            <div class="spinner"></div>
            <p>Analyzing your query...</p>
          </div>
        </div>

        <!-- Overlay -->
        <div id="chatbot-overlay" class="chatbot-overlay hidden"></div>
      </div>
    `;

    // Insert at end of body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Add CSS styles
    this.addChatbotStyles();
  }

  addChatbotStyles() {
    const styles = `
      <style>
        /* Chatbot Container */
        #chatbot-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 9999;
        }

        /* Floating Button */
        .chatbot-floating-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #15696B 0%, #0F4449 100%);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(21, 105, 107, 0.4);
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .chatbot-floating-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(21, 105, 107, 0.6);
        }

        .chatbot-floating-btn:active {
          transform: scale(0.95);
        }

        .chatbot-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff6b6b;
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }

        /* Modal */
        .chatbot-modal {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 420px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
          z-index: 10000;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-modal.hidden {
          display: none;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        /* Header */
        .chatbot-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
          background: linear-gradient(135deg, #15696B 0%, #0F4449 100%);
          color: white;
          border-radius: 12px 12px 0 0;
        }

        .chatbot-title-section h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .chatbot-title-section p {
          margin: 4px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        }

        .chatbot-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chatbot-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Messages Area */
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fafafa;
        }

        .chatbot-message {
          display: flex;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chatbot-message p {
          margin: 0;
          padding: 10px 14px;
          border-radius: 10px;
          max-width: 85%;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }

        .chatbot-message ul {
          margin: 10px 0;
          padding-left: 20px;
          font-size: 0.9em;
        }

        .chatbot-message li {
          margin: 4px 0;
        }

        /* User Message */
        .user-message {
          justify-content: flex-end;
        }

        .user-message p {
          background: #15696B;
          color: white;
          margin-left: auto;
        }

        /* Bot Message */
        .bot-message {
          justify-content: flex-start;
        }

        .bot-message p {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
        }

        .bot-message ul {
          background: white;
          border: 1px solid #e0e0e0;
          padding: 12px 14px;
          border-radius: 10px;
          max-width: 85%;
          margin-left: 0;
        }

        /* Table Response */
        .chatbot-table-wrapper {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
          max-width: 85%;
          font-size: 12px;
        }

        .chatbot-table-wrapper table {
          width: 100%;
          border-collapse: collapse;
        }

        .chatbot-table-wrapper th,
        .chatbot-table-wrapper td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #f0f0f0;
        }

        .chatbot-table-wrapper th {
          background: #15696B;
          color: white;
          font-weight: 600;
        }

        .chatbot-table-wrapper tr:last-child td {
          border-bottom: none;
        }

        /* Input Area */
        .chatbot-input-area {
          display: flex;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid #f0f0f0;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        .chatbot-input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }

        .chatbot-input:focus {
          border-color: #15696B;
        }

        .chatbot-send-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: #15696B;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .chatbot-send-btn:hover {
          background: #0F4449;
        }

        .chatbot-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* Loading Indicator */
        .chatbot-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 10px;
          color: #666;
          font-size: 14px;
        }

        .chatbot-loading.hidden {
          display: none;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f0f0f0;
          border-top-color: #15696B;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Overlay */
        .chatbot-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 9998;
        }

        .chatbot-overlay.hidden {
          display: none;
        }

        /* Mobile Responsive */
        @media (max-width: 640px) {
          .chatbot-modal {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 70vh;
            border-radius: 20px 20px 0 0;
            animation: slideUpMobile 0.3s ease;
          }

          @keyframes slideUpMobile {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }

          .chatbot-modal.hidden {
            animation: slideDownMobile 0.3s ease;
          }

          @keyframes slideDownMobile {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(100%);
            }
          }

          .chatbot-floating-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }

          .chatbot-message p,
          .chatbot-table-wrapper {
            max-width: 90%;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const sendBtn = document.getElementById('chatbot-send-btn');
    const input = document.getElementById('chatbot-input');
    const overlay = document.getElementById('chatbot-overlay');

    // Toggle chatbot
    toggleBtn.addEventListener('click', () => this.toggleChatbot());
    closeBtn.addEventListener('click', () => this.closeChatbot());
    overlay.addEventListener('click', () => this.closeChatbot());

    // Send message
    sendBtn.addEventListener('click', () => this.handleSendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
  }

  toggleChatbot() {
    if (this.isOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }

  openChatbot() {
    const modal = document.getElementById('chatbot-modal');
    const overlay = document.getElementById('chatbot-overlay');
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    this.isOpen = true;
    document.getElementById('chatbot-input').focus();
  }

  closeChatbot() {
    const modal = document.getElementById('chatbot-modal');
    const overlay = document.getElementById('chatbot-overlay');
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    this.isOpen = false;
  }

  async handleSendMessage() {
    const input = document.getElementById('chatbot-input');
    const query = input.value.trim();

    if (!query) return;

    // Add user message to chat
    this.addMessage(query, 'user');
    input.value = '';

    // Show loading
    this.showLoading(true);

    try {
      // Call Supabase Edge Function
      const response = await supabaseClient.functions.invoke('chatbot-query', {
        body: {
          query: query,
          facility_id: this.facilityId
        }
      });

      // Hide loading
      this.showLoading(false);

      if (response.error) {
        throw new Error(response.error.message || 'Error processing query');
      }

      const result = response.data;

      // Add bot response
      if (result.type === 'table') {
        this.addTableMessage(result.data, result.columns);
      } else {
        this.addMessage(result.message, 'bot');
      }
    } catch (error) {
      this.showLoading(false);
      console.error('Chatbot error:', error);
      this.addMessage(
        'Sorry, I encountered an error processing your query. Please try again.',
        'bot'
      );
    }
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;

    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addTableMessage(rows, columns) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message bot-message';

    if (!rows || rows.length === 0) {
      const p = document.createElement('p');
      p.textContent = 'No data found matching your query.';
      messageDiv.appendChild(p);
    } else {
      const wrapper = document.createElement('div');
      wrapper.className = 'chatbot-table-wrapper';

      const table = document.createElement('table');
      
      // Create header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create body
      const tbody = document.createElement('tbody');
      rows.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
          const td = document.createElement('td');
          td.textContent = row[col] || '-';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      wrapper.appendChild(table);
      messageDiv.appendChild(wrapper);
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showLoading(show) {
    const loading = document.getElementById('chatbot-loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FacilityChatbot();
});
