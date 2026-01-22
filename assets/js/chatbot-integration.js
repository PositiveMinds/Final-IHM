/**
 * Integration Layer for Advanced Chatbot Features
 * Connects advanced features to the main chatbot and UI
 */

class ChatbotIntegration {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize all integrations
     */
    async init() {
        try {
            // Initialize advanced features
            await advancedChatbotFeatures.initializeAdvancedFeatures();

            // Add methods to main chatbot
            this.integrateWithMainChatbot();

            // Add UI methods
            this.integrateWithUI();

            this.initialized = true;
            console.log('Chatbot integrations initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('Error initializing integrations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Integrate advanced features with main chatbot
     */
    integrateWithMainChatbot() {
        if (!window.healthFlowChatbot) return;

        const chatbot = window.healthFlowChatbot;

        /**
         * Enhanced: Send appointment reminder with email
         */
        chatbot.sendReminderWithEmail = async (appointmentId) => {
            try {
                const appointment = chatbot.lastQueryResults?.find(a => a.id === appointmentId);
                if (!appointment) throw new Error('Appointment not found');

                // Send email reminder
                const emailResult = await advancedChatbotFeatures.emailService.sendReminderEmail(
                    { email: appointment.patient_email, patient_no: appointment.patient_no, patient_name: appointment.patient_name },
                    appointment
                );

                // Send push notification
                const notifResult = await advancedChatbotFeatures.pushNotificationService.sendAppointmentReminder(
                    { patient_name: appointment.patient_name },
                    appointment,
                    1440 // 24 hours before
                );

                return {
                    success: true,
                    email: emailResult,
                    notification: notifResult
                };
            } catch (error) {
                console.error('Error sending reminder:', error);
                return { success: false, error: error.message };
            }
        };

        /**
         * Create recurring appointment series
         */
        chatbot.createRecurringAppointments = (appointmentId, patientId, pattern, startDate, endDate = null, maxOccurrences = null) => {
            return recurringManager.createRecurringPattern(
                appointmentId,
                patientId,
                pattern,
                startDate,
                endDate,
                maxOccurrences
            );
        };

        /**
         * Check for conflicts before scheduling
         */
        chatbot.checkAppointmentConflicts = (newAppointment, existingAppointments = null) => {
            const appointments = existingAppointments || chatbot.lastQueryResults || [];
            return conflictDetector.checkConflicts(newAppointment, appointments);
        };

        /**
         * Schedule automated follow-ups
         */
        chatbot.scheduleFollowUps = (appointmentId, patientId, followUpType, appointmentDate) => {
            return followUpScheduler.scheduleFollowUp(
                appointmentId,
                patientId,
                followUpType,
                appointmentDate
            );
        };

        /**
         * Export with advanced formatting
         */
        chatbot.exportWithAdvancedFormatting = (appointments) => {
            return advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(appointments);
        };

        /**
         * Get all advanced feature statistics
         */
        chatbot.getAdvancedStats = () => {
            return {
                recurring: recurringManager.getRecurringStats(),
                conflicts: {
                    total: conflictDetector.conflicts.length,
                    recent: conflictDetector.conflicts.slice(-10)
                },
                followUps: followUpScheduler.getFollowUpStats(),
                notifications: advancedChatbotFeatures.pushNotificationService.getNotificationStatus(),
                emails: {
                    sent: advancedChatbotFeatures.emailService.sentEmails.length,
                    latest: advancedChatbotFeatures.emailService.sentEmails.slice(-5)
                }
            };
        };
    }

    /**
     * Integrate with chatbot UI
     */
    integrateWithUI() {
        if (!window.chatbotUI) return;

        const ui = window.chatbotUI;

        /**
         * Enhanced quick actions with new features
         */
        ui.showAdvancedOptions = () => {
            const html = `
            <div style="padding: 15px;">
                <h4 style="margin-top: 0;">✨ Advanced Features</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="chatbotUI.initializeRecurringFlow()" class="btn btn-sm btn-info" style="width: 100%;">
                        🔄 Recurring Appointments
                    </button>
                    <button onclick="chatbotUI.checkConflictsFlow()" class="btn btn-sm btn-warning" style="width: 100%;">
                        ⚠️ Check Conflicts
                    </button>
                    <button onclick="chatbotUI.setupFollowUpsFlow()" class="btn btn-sm btn-primary" style="width: 100%;">
                        📋 Follow-ups
                    </button>
                    <button onclick="chatbotUI.configureEmailService()" class="btn btn-sm btn-success" style="width: 100%;">
                        📧 Email Settings
                    </button>
                    <button onclick="chatbotUI.manageNotifications()" class="btn btn-sm btn-primary" style="width: 100%;">
                        🔔 Notifications
                    </button>
                    <button onclick="chatbotUI.exportAdvanced()" class="btn btn-sm btn-secondary" style="width: 100%;">
                        📊 Advanced Export
                    </button>
                </div>
            </div>`;

            ui.addMessage(html, 'bot', true);
        };

        /**
         * Initialize recurring appointments flow
         */
        ui.initializeRecurringFlow = () => {
            const html = `
            <div style="padding: 15px;">
                <h4>Create Recurring Appointment Pattern</h4>
                <p>Select a pattern for automatic appointment scheduling:</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button onclick="chatbotUI.selectRecurringPattern('weekly')" class="btn btn-outline-primary btn-sm">Weekly</button>
                    <button onclick="chatbotUI.selectRecurringPattern('bi-weekly')" class="btn btn-outline-primary btn-sm">Bi-weekly</button>
                    <button onclick="chatbotUI.selectRecurringPattern('monthly')" class="btn btn-outline-primary btn-sm">Monthly</button>
                    <button onclick="chatbotUI.selectRecurringPattern('quarterly')" class="btn btn-outline-primary btn-sm">Quarterly</button>
                    <button onclick="chatbotUI.selectRecurringPattern('semi-annual')" class="btn btn-outline-primary btn-sm">Semi-annual</button>
                    <button onclick="chatbotUI.selectRecurringPattern('annual')" class="btn btn-outline-primary btn-sm">Annual</button>
                </div>
            </div>`;

            ui.addMessage(html, 'bot', true);
        };

        /**
         * Select recurring pattern
         */
        ui.selectRecurringPattern = (pattern) => {
            if (!healthFlowChatbot.lastQueryResults?.length) {
                ui.addMessage('Please retrieve appointments first.', 'bot', false);
                return;
            }

            const appt = healthFlowChatbot.lastQueryResults[0];
            const startDate = new Date(appt.appointment_date);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);

            const result = recurringManager.createRecurringPattern(
                appt.id,
                appt.patient_no,
                pattern,
                startDate,
                endDate,
                12
            );

            const message = result.success
                ? `✓ Created ${pattern} recurring series with ${result.appointmentCount} appointments`
                : `Error: ${result.error}`;

            ui.addMessage(message, 'bot', false);
        };

        /**
         * Check conflicts flow
         */
        ui.checkConflictsFlow = () => {
            if (!healthFlowChatbot.lastQueryResults?.length) {
                ui.addMessage('Please retrieve appointments first.', 'bot', false);
                return;
            }

            ui.showLoading();

            try {
                const results = [];
                const appointments = healthFlowChatbot.lastQueryResults;

                // Check each appointment for conflicts
                appointments.forEach((appt, index) => {
                    const otherAppointments = appointments.filter((_, i) => i !== index);
                    const checkResult = conflictDetector.checkConflicts(appt, otherAppointments);

                    if (checkResult.hasConflicts) {
                        results.push({
                            appointmentId: appt.id,
                            patient: appt.patient_name,
                            conflicts: checkResult.conflicts
                        });
                    }
                });

                ui.removeLoading();

                if (results.length === 0) {
                    ui.addMessage('✓ No conflicts detected in current appointments', 'bot', false);
                } else {
                    const html = `
                    <div style="padding: 15px;">
                        <h4 style="color: #d32f2f;">⚠️ Conflicts Found</h4>
                        ${results.map(result => `
                            <div style="background: #ffebee; padding: 10px; margin: 10px 0; border-left: 4px solid #d32f2f; border-radius: 3px;">
                                <p><strong>${result.patient}</strong></p>
                                ${result.conflicts.map(c => `
                                    <p style="margin: 5px 0; font-size: 12px;">
                                        <span style="background: #ffcdd2; padding: 2px 6px; border-radius: 3px;">${c.type}</span>
                                        ${c.message}
                                    </p>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>`;

                    ui.addMessage(html, 'bot', true);
                }
            } catch (error) {
                ui.removeLoading();
                ui.addMessage(`Error: ${error.message}`, 'bot', false);
            }
        };

        /**
         * Setup follow-ups flow
         */
        ui.setupFollowUpsFlow = () => {
            if (!healthFlowChatbot.lastQueryResults?.length) {
                ui.addMessage('Please retrieve appointments first.', 'bot', false);
                return;
            }

            const html = `
            <div style="padding: 15px;">
                <h4>Setup Automated Follow-ups</h4>
                <p>Select follow-up type for ${healthFlowChatbot.lastQueryResults.length} appointments:</p>
                <div style="display: grid; gap: 8px;">
                    <button onclick="chatbotUI.createFollowUpsForAll('post_appointment')" class="btn btn-outline-info btn-sm" style="text-align: left;">
                        📧 Post-appointment (24 hours)
                    </button>
                    <button onclick="chatbotUI.createFollowUpsForAll('medication_reminder')" class="btn btn-outline-info btn-sm" style="text-align: left;">
                        💊 Medication reminder (12 hours)
                    </button>
                    <button onclick="chatbotUI.createFollowUpsForAll('lab_results')" class="btn btn-outline-info btn-sm" style="text-align: left;">
                        🧪 Lab results review (3 days)
                    </button>
                    <button onclick="chatbotUI.createFollowUpsForAll('treatment_review')" class="btn btn-outline-info btn-sm" style="text-align: left;">
                        📋 Treatment review (7 days)
                    </button>
                </div>
            </div>`;

            ui.addMessage(html, 'bot', true);
        };

        /**
         * Create follow-ups for all appointments
         */
        ui.createFollowUpsForAll = (followUpType) => {
            ui.showLoading();

            try {
                let createdCount = 0;

                healthFlowChatbot.lastQueryResults.forEach(appt => {
                    const result = followUpScheduler.scheduleFollowUp(
                        appt.id,
                        appt.patient_no,
                        followUpType,
                        appt.appointment_date
                    );

                    if (result.success) createdCount++;
                });

                ui.removeLoading();
                const typeLabel = followUpType.replace(/_/g, ' ').toUpperCase();
                ui.addMessage(
                    `✓ Scheduled ${typeLabel} follow-ups for ${createdCount} appointments`,
                    'bot',
                    false
                );
            } catch (error) {
                ui.removeLoading();
                ui.addMessage(`Error: ${error.message}`, 'bot', false);
            }
        };

        /**
         * Configure email service
         */
        ui.configureEmailService = () => {
            const provider = prompt('Email provider (sendgrid/ses/smtp):', 'sendgrid');
            if (!provider) return;

            const apiKey = prompt('API Key:');
            if (!apiKey) return;

            const fromEmail = prompt('From email address:');
            if (!fromEmail) return;

            const result = advancedChatbotFeatures.emailService.configure(provider, apiKey, fromEmail);
            ui.addMessage(result.message, 'bot', false);
        };

        /**
         * Manage notifications
         */
        ui.manageNotifications = async () => {
            const status = advancedChatbotFeatures.pushNotificationService.getNotificationStatus();

            if (!status.supported) {
                ui.addMessage('Push notifications are not supported in this browser.', 'bot', false);
                return;
            }

            if (status.permission !== 'granted') {
                const result = await advancedChatbotFeatures.pushNotificationService.requestPermission();
                ui.addMessage(
                    result.success
                        ? '✓ Notifications enabled'
                        : '✗ Notifications disabled',
                    'bot',
                    false
                );
            } else {
                const html = `
                <div style="padding: 15px;">
                    <h4>🔔 Notification Settings</h4>
                    <p><strong>Status:</strong> ✓ Enabled</p>
                    <p><strong>Permission:</strong> ${status.permission}</p>
                    <p><strong>Notifications sent:</strong> ${status.count}</p>
                </div>`;

                ui.addMessage(html, 'bot', true);
            }
        };

        /**
         * Advanced export with formatting
         */
        ui.exportAdvanced = () => {
            if (!healthFlowChatbot.lastQueryResults?.length) {
                ui.addMessage('Please retrieve appointments first.', 'bot', false);
                return;
            }

            ui.showLoading();

            try {
                const result = advancedChatbotFeatures.excelExporter.exportAppointmentsWithFormatting(
                    healthFlowChatbot.lastQueryResults
                );

                ui.removeLoading();
                ui.addMessage(result.success ? '✓ Excel file downloaded' : `Error: ${result.error}`, 'bot', false);
            } catch (error) {
                ui.removeLoading();
                ui.addMessage(`Error: ${error.message}`, 'bot', false);
            }
        };
    }

    /**
     * Add button to chatbot UI for advanced features
     */
    addAdvancedFeaturesButton() {
        if (!window.chatbotUI) return;

        const addButton = () => {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            // Add a button to show advanced features
            const observer = new MutationObserver(() => {
                const lastMessage = messagesContainer.lastElementChild;
                if (lastMessage && !lastMessage.querySelector('[data-advanced-features-added]')) {
                    const button = document.createElement('button');
                    button.innerHTML = '✨ Show Advanced Features';
                    button.className = 'btn btn-sm btn-info';
                    button.style.marginTop = '10px';
                    button.onclick = () => window.chatbotUI?.showAdvancedOptions?.();
                    button.setAttribute('data-advanced-features-button', 'true');

                    // Only add to appropriate messages
                    if (lastMessage.textContent.includes('retrieved') || lastMessage.textContent.includes('found')) {
                        lastMessage.appendChild(button);
                        lastMessage.setAttribute('data-advanced-features-added', 'true');
                    }
                }
            });

            observer.observe(messagesContainer, { childList: true });
        };

        setTimeout(addButton, 1000);
    }
}

// Initialize integrations when document is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(async () => {
        if (typeof AdvancedChatbotFeatures !== 'undefined') {
            const integration = new ChatbotIntegration();
            await integration.init();
            integration.addAdvancedFeaturesButton();

            // Store reference globally
            window.chatbotIntegration = integration;
        }
    }, 2000);
});
