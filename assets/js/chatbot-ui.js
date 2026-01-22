/**
 * Chatbot UI Controller
 * Manages the chatbot interface and user interactions
 */

class ChatbotUI {
    constructor() {
        this.chatbotContainer = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.sendButton = null;
        this.isOpen = false;
        this.lastFilters = {}; // Store last query filters for save functionality
        this.initialSuggestions = [
             "Show me all HIV positive patients",
             "List active patients with diabetes",
             "How many critical patients do we have?",
             "Appointments next week",
             "Show missed appointments",
             "Appointments this month"
         ];
    }

    /**
     * Initialize chatbot UI
     */
    init() {
        this.createChatbotElements();
        this.attachEventListeners();
        this.displayWelcomeMessage();
    }

    /**
     * Create chatbot DOM elements
     */
    createChatbotElements() {
        // Create FAB button
        const fabBtn = document.createElement('button');
        fabBtn.className = 'chatbot-fab';
        fabBtn.innerHTML = '<span class="chatbot-fab-icon">💬</span>';
        fabBtn.id = 'chatbot-fab';
        fabBtn.title = 'HealthFlow AI Assistant';
        fabBtn.setAttribute('aria-label', 'Open HealthFlow AI Assistant');
        document.body.appendChild(fabBtn);

        // Create chatbot container
        const container = document.createElement('div');
        container.className = 'chatbot-container hidden';
        container.id = 'chatbot-container';
        container.innerHTML = `
      <div class="chatbot-header">
        <h3 class="chatbot-header-title">
          <span class="chatbot-header-icon">🤖</span>
          HealthFlow AI Assistant
        </h3>
        <button class="chatbot-close-btn" id="chatbot-close-btn" title="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages"></div>
      <div class="chatbot-input-area">
        <input 
          type="text" 
          class="chatbot-input" 
          id="chatbot-input" 
          placeholder="Ask about patients, conditions, appointments..."
          autocomplete="off"
        >
        <button class="chatbot-send-btn" id="chatbot-send-btn" title="Send message">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;
        document.body.appendChild(container);

        // Store references
        this.chatbotContainer = container;
        this.messagesContainer = container.querySelector('#chatbot-messages');
        this.inputField = container.querySelector('#chatbot-input');
        this.sendButton = container.querySelector('#chatbot-send-btn');
        this.fabBtn = fabBtn;
        this.closeBtn = container.querySelector('#chatbot-close-btn');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // FAB button
        this.fabBtn.addEventListener('click', () => this.toggle());

        // Close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Send button
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Enter key in input
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Focus input when opened
        this.inputField.addEventListener('focus', () => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    /**
     * Display welcome message and suggestions
     */
    displayWelcomeMessage() {
        const dbConnected = typeof window.supabaseClient !== 'undefined' ? '✓ Connected' : '✗ Not connected';
        const welcomeHTML = `
      <p>👋 Welcome to HealthFlow AI Assistant!</p>
      <p>I can help you search and analyze patient data. Here are some things you can ask:</p>
      <div class="chatbot-suggestions">
        ${this.initialSuggestions.map((suggestion, index) => `
          <button class="chatbot-suggestion-btn" onclick="chatbotUI.sendMessage('${suggestion}')">
            ${suggestion}
          </button>
        `).join('')}
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 12px;">Database: ${dbConnected}</p>
    `;

        this.addMessage(welcomeHTML, 'bot');
        console.log('Chatbot initialized. Supabase client:', typeof window.supabaseClient);
    }

    /**
     * Add message to chat
     */
    addMessage(content, role = 'bot', isHTML = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${role}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chatbot-message-avatar';
        avatarDiv.textContent = role === 'bot' ? '🤖' : '👤';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';

        if (isHTML) {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        this.messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 0);
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        messageDiv.id = 'loading-message';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chatbot-message-avatar';
        avatarDiv.textContent = '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';
        contentDiv.innerHTML = `
      <div class="chatbot-loading">
        <div class="chatbot-loading-dot"></div>
        <div class="chatbot-loading-dot"></div>
        <div class="chatbot-loading-dot"></div>
      </div>
    `;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);

        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        this.sendButton.disabled = true;
        this.inputField.disabled = true;
    }

    /**
     * Remove loading indicator
     */
    removeLoading() {
        const loadingMessage = this.messagesContainer.querySelector('#loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        this.sendButton.disabled = false;
        this.inputField.disabled = false;
    }

    /**
     * Send message
     */
    async sendMessage(message = null) {
        const userMessage = message || this.inputField.value.trim();

        if (!userMessage) return;

        // Add user message
        this.addMessage(userMessage, 'user', false);
        this.inputField.value = '';

        // Show loading
        this.showLoading();

        try {
            // Extract and store filters for save functionality
            this.lastFilters = healthFlowChatbot.extractFilters(userMessage);

            // Process message with chatbot
            const response = await healthFlowChatbot.processMessage(userMessage);

            // Remove loading
            this.removeLoading();

            // Add bot response
            this.addMessage(response, 'bot', true);

            // Add quick actions if results were found
            if (!response.includes('Error') && !response.includes('No')) {
                this.addQuickActions(userMessage);
            }
        } catch (error) {
            this.removeLoading();
            this.addMessage(`Error: ${error.message}`, 'bot', false);
        }

        // Focus input
        this.inputField.focus();
    }

    /**
     * Add quick action buttons after results
     */
    addQuickActions(lastQuery) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'chatbot-message bot';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'chatbot-message-content';
      contentDiv.innerHTML = `
        <div class="chatbot-quick-actions">
          <button class="chatbot-action-btn" onclick="chatbotUI.promptSaveSearch('${lastQuery.replace(/'/g, "\\'")}')">
            💾 Save
          </button>
          <button class="chatbot-action-btn" onclick="chatbotUI.exportResults()">
            📥 Export
          </button>
          <button class="chatbot-action-btn" onclick="chatbotUI.exportWithStats()">
            📊 Stats
          </button>
          <button class="chatbot-action-btn" onclick="chatbotUI.showReminderOptions()">
            🔔 Reminders
          </button>
          <button class="chatbot-action-btn" onclick="chatbotUI.showBulkActions()">
            ⚙️ Bulk
          </button>
        </div>
      `;

      messageDiv.appendChild(contentDiv);
      this.messagesContainer.appendChild(messageDiv);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Prompt user to save search
     */
    promptSaveSearch(query) {
        const searchName = prompt('Save this search as:', '');
        if (searchName) {
            healthFlowChatbot.saveSearch(searchName, this.lastFilters);
            this.addMessage(`✓ Saved as "${searchName}"`, 'bot', false);
        }
    }

    /**
     * Show saved searches
     */
    showSavedSearches() {
        const html = healthFlowChatbot.listSavedSearches();
        this.addMessage(html, 'bot', true);
    }

    /**
     * Export results to CSV
     */
    exportResults() {
      if (!this.lastFilters || Object.keys(this.lastFilters).length === 0) {
        this.addMessage('Please run a search first before exporting.', 'bot', false);
        return;
      }

      // Trigger export
      (async () => {
        try {
          const patients = await healthFlowChatbot.queryPatients(this.lastFilters);
          if (patients && patients.length > 0) {
            // Export to XLSX using advanced exporter
            if (typeof advancedChatbotFeatures !== 'undefined' && advancedChatbotFeatures.excelExporter) {
              healthFlowChatbot.lastQueryResults = patients;
              await advancedChatbotFeatures.excelExporter.exportPatientsWithFormatting(patients);
              this.addMessage(`✓ Exported ${patients.length} patients to XLSX file. Download started!`, 'bot', false);
            } else {
              this.addMessage('Excel exporter not available', 'bot', false);
            }
          } else {
            this.addMessage('No data to export.', 'bot', false);
          }
        } catch (error) {
          this.addMessage(`Error exporting: ${error.message}`, 'bot', false);
        }
      })();
    }

    /**
     * Show prediction analytics
     */
    showPredictions() {
      if (!this.lastFilters || Object.keys(this.lastFilters).length === 0) {
        this.addMessage('Please run a search first to see predictions.', 'bot', false);
        return;
      }

      (async () => {
        this.showLoading();
        try {
          const response = await healthFlowChatbot.predictPatientOutcomes(this.lastFilters);
          this.removeLoading();
          this.addMessage(response, 'bot', true);
        } catch (error) {
          this.removeLoading();
          this.addMessage(`Error: ${error.message}`, 'bot', false);
        }
      })();
    }

    /**
     * Show comparison tool
     */
    showComparison() {
      const group1 = prompt('Enter first group (e.g., "HIV positive"):');
      if (!group1) return;

      const group2 = prompt('Enter second group (e.g., "HIV negative"):');
      if (!group2) return;

      (async () => {
        this.showLoading();
        try {
          const filters1 = healthFlowChatbot.extractFilters(group1);
          const filters2 = healthFlowChatbot.extractFilters(group2);
          const response = await healthFlowChatbot.comparePatientGroups(filters1, filters2, group1, group2);
          this.removeLoading();
          this.addMessage(response, 'bot', true);
        } catch (error) {
          this.removeLoading();
          this.addMessage(`Error: ${error.message}`, 'bot', false);
        }
      })();
    }

    /**
     * Toggle chatbot visibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open chatbot
     */
    open() {
        this.chatbotContainer.classList.remove('hidden');
        this.fabBtn.classList.add('hidden');
        this.isOpen = true;
        this.inputField.focus();
    }

    /**
     * Close chatbot
     */
    close() {
        this.chatbotContainer.classList.add('hidden');
        this.fabBtn.classList.remove('hidden');
        this.isOpen = false;
    }

    /**
     * Export results with statistics
     */
    exportWithStats() {
        if (!healthFlowChatbot.lastQueryResults || healthFlowChatbot.lastQueryResults.length === 0) {
            this.addMessage('Please run a search first before exporting.', 'bot', false);
            return;
        }

        const format = confirm('Export as Excel with statistics? Click OK for Excel, Cancel for PDF');
        if (format === null) return;

        healthFlowChatbot.exportAppointmentsWithStats(format ? 'excel' : 'pdf');
        this.addMessage('✓ Exporting with statistics...', 'bot', false);
    }

    /**
     * Show appointment reminder options
     */
    showReminderOptions() {
        if (!healthFlowChatbot.lastQueryResults || healthFlowChatbot.lastQueryResults.length === 0) {
            this.addMessage('Please retrieve appointments first.', 'bot', false);
            return;
        }

        const html = `
        <div style="padding: 10px;">
            <p><strong>Set Reminders for ${healthFlowChatbot.lastQueryResults.length} Appointments</strong></p>
            <button onclick="chatbotUI.setReminderForAll('email', 1440)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                📧 Email (24 hours before)
            </button>
            <button onclick="chatbotUI.setReminderForAll('email', 60)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                📧 Email (1 hour before)
            </button>
            <button onclick="chatbotUI.setReminderForAll('notification', 1440)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                🔔 Notification (24 hours before)
            </button>
            <button onclick="chatbotUI.setReminderForAll('notification', 1)" class="btn btn-sm btn-warning" style="margin: 5px;">
                ⏱️ Test (1 minute before)
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                Reminders will be scheduled for all retrieved appointments. Test reminder triggers after 1 minute.
            </p>
        </div>`;

        this.addMessage(html, 'bot', true);
    }

    /**
     * Set reminder for all appointments
     */
    setReminderForAll(reminderType, minutesBefore) {
        if (!healthFlowChatbot.lastQueryResults) {
            this.addMessage('No appointments selected.', 'bot', false);
            return;
        }

        let reminderCount = 0;
        healthFlowChatbot.lastQueryResults.forEach(appt => {
            // For 1-minute test reminders, use immediate scheduling
            if (minutesBefore === 1) {
                const reminder = {
                    appointmentId: appt.id,
                    patientName: appt.patient_name,
                    appointmentDate: appt.appointment_date,
                    reminderType: reminderType,
                    minutesBefore: minutesBefore,
                    createdAt: new Date()
                };
                
                // Store reminder
                if (!healthFlowChatbot.appointmentReminders) {
                    healthFlowChatbot.appointmentReminders = {};
                }
                healthFlowChatbot.appointmentReminders[appt.id] = reminder;
                
                // Set timeout for immediate notification (1 minute = 60000ms)
                setTimeout(() => {
                    this.triggerReminderNotification(reminder);
                }, 60000);
                
                reminderCount++;
            } else {
                const result = healthFlowChatbot.createAppointmentReminder(appt.id, reminderType, minutesBefore);
                if (result.success) reminderCount++;
            }
        });

        const typeLabel = reminderType === 'email' ? '📧 Email' : '🔔 Notification';
        const timeInfo = minutesBefore === 1 ? '1 minute before (TEST)' : `${minutesBefore} minutes before`;
        const message = `✓ Set ${typeLabel} reminders for ${reminderCount} appointments (${timeInfo})`;
        this.addMessage(message, 'bot', false);
    }

    /**
     * Trigger reminder notification for testing
     */
    triggerReminderNotification(reminder) {
        const message = `Reminder: Appointment for ${reminder.patientName} scheduled on ${new Date(reminder.appointmentDate).toLocaleDateString()}`;
        
        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('HealthFlow Appointment Reminder', {
                body: message,
                icon: 'assets/images/favicon.svg',
                tag: `reminder-${reminder.appointmentId}`
            });
        }
        
        // Also show in chatbot
        this.addMessage(`🔔 <strong>Reminder:</strong> ${message}`, 'bot', false);
    }

    /**
     * Show bulk action options
     */
    showBulkActions() {
        if (!healthFlowChatbot.lastQueryResults || healthFlowChatbot.lastQueryResults.length === 0) {
            this.addMessage('Please retrieve appointments first.', 'bot', false);
            return;
        }

        const html = `
        <div style="padding: 10px;">
            <p><strong>Bulk Actions for ${healthFlowChatbot.lastQueryResults.length} Appointments</strong></p>
            <button onclick="chatbotUI.bulkUpdateStatus('Completed')" class="btn btn-sm btn-success" style="margin: 5px;">
                ✓ Mark as Completed
            </button>
            <button onclick="chatbotUI.bulkUpdateStatus('Missed')" class="btn btn-sm btn-danger" style="margin: 5px;">
                ✗ Mark as Missed
            </button>
            <button onclick="chatbotUI.bulkUpdateStatus('Cancelled')" class="btn btn-sm btn-warning" style="margin: 5px;">
                ⊘ Cancel All
            </button>
            <button onclick="chatbotUI.bulkSetReminders()" class="btn btn-sm btn-info" style="margin: 5px;">
                🔔 Set Reminders for All
            </button>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                <strong>Warning:</strong> These actions will affect all ${healthFlowChatbot.lastQueryResults.length} appointments. Confirm each action.
            </p>
        </div>`;

        this.addMessage(html, 'bot', true);
    }

    /**
     * Bulk update appointment status
     */
    async bulkUpdateStatus(status) {
        if (!healthFlowChatbot.lastQueryResults) {
            this.addMessage('No appointments selected.', 'bot', false);
            return;
        }

        const count = healthFlowChatbot.lastQueryResults.length;
        const confirmed = confirm(`Mark ${count} appointments as ${status}? This cannot be undone.`);

        if (!confirmed) {
            this.addMessage('Bulk update cancelled.', 'bot', false);
            return;
        }

        this.showLoading();

        try {
            const appointmentIds = healthFlowChatbot.lastQueryResults.map(a => a.id);
            const result = await healthFlowChatbot.bulkUpdateAppointmentStatus(appointmentIds, status);

            this.removeLoading();

            if (result.success) {
                const statusEmoji = 
                    status === 'Completed' ? '✓' :
                    status === 'Missed' ? '✗' : '⊘';
                this.addMessage(
                    `${statusEmoji} Successfully updated ${result.updatedCount} appointments to "${status}"`,
                    'bot',
                    false
                );
            }
        } catch (error) {
            this.removeLoading();
            this.addMessage(`Error: ${error.message}`, 'bot', false);
        }
    }

    /**
     * Bulk set reminders
     */
    bulkSetReminders() {
        if (!healthFlowChatbot.lastQueryResults) {
            this.addMessage('No appointments selected.', 'bot', false);
            return;
        }

        const reminderHtml = `
        <div style="padding: 10px;">
            <p><strong>Set Reminders for ${healthFlowChatbot.lastQueryResults.length} Appointments</strong></p>
            <button onclick="chatbotUI.setReminderForAll('email', 1440)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                📧 24 Hours Before
            </button>
            <button onclick="chatbotUI.setReminderForAll('email', 60)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                📧 1 Hour Before
            </button>
            <button onclick="chatbotUI.setReminderForAll('notification', 1440)" class="btn btn-sm btn-outline-primary" style="margin: 5px;">
                🔔 24 Hours Before
            </button>
        </div>`;

        this.addMessage(reminderHtml, 'bot', true);
    }
}

// Initialize UI when DOM is ready
let chatbotUI;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for chatbot core to be available
    if (typeof healthFlowChatbot !== 'undefined') {
        chatbotUI = new ChatbotUI();
        chatbotUI.init();
    } else {
        console.warn('HealthFlow Chatbot core not loaded');
    }
});