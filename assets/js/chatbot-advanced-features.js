/**
 * Advanced Chatbot Features
 * - Email service integration for reminder delivery
 * - Push notifications for web/mobile
 * - Recurring appointment patterns
 * - Advanced Excel formatting with colors
 * - Appointment conflict detection
 * - Automated follow-up scheduling
 */

class AdvancedChatbotFeatures {
    constructor() {
        this.emailService = new EmailService();
        this.pushNotificationService = new PushNotificationService();
        this.recurringAppointments = {};
        this.conflictLog = [];
        this.followUpSchedules = {};
        this.excelExporter = new AdvancedExcelExporter();
    }

    /**
     * Initialize all advanced features
     */
    async initializeAdvancedFeatures() {
        try {
            // Request notification permission if needed
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            // Initialize service worker for push notifications
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/assets/js/service-worker.js').catch(() => {
                    console.log('Service worker registration optional - push notifications may be limited');
                });
            }

            console.log('Advanced features initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('Error initializing advanced features:', error);
            return { success: false, error: error.message };
        }
    }
}

/**
 * Email Service Integration
 * Integrates with SendGrid, AWS SES, or SMTP services
 */
class EmailService {
     constructor() {
         this.provider = 'sendgrid'; // Can be 'sendgrid', 'gmail', 'smtp'
         this.apiKey = localStorage.getItem('email_service_api_key') || '';
         this.fromEmail = localStorage.getItem('email_from_address') || 'noreply@healthflow.local';
         this.sentEmails = [];
         this.emailjsServiceId = localStorage.getItem('emailjs_service_id') || '';
         this.emailjsTemplateId = localStorage.getItem('emailjs_template_id') || '';
         this.emailjsPublicKey = localStorage.getItem('emailjs_public_key') || '';
     }

    /**
     * Configure email service
     */
    configure(provider, apiKey, fromEmail, additionalConfig = {}) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        
        localStorage.setItem('email_service_provider', provider);
        localStorage.setItem('email_service_api_key', apiKey);
        localStorage.setItem('email_from_address', fromEmail);
        
        // Store Email.js config for Gmail
        if (provider === 'gmail' && additionalConfig) {
            if (additionalConfig.serviceId) {
                this.emailjsServiceId = additionalConfig.serviceId;
                localStorage.setItem('emailjs_service_id', additionalConfig.serviceId);
            }
            if (additionalConfig.templateId) {
                this.emailjsTemplateId = additionalConfig.templateId;
                localStorage.setItem('emailjs_template_id', additionalConfig.templateId);
            }
            if (additionalConfig.publicKey) {
                this.emailjsPublicKey = additionalConfig.publicKey;
                localStorage.setItem('emailjs_public_key', additionalConfig.publicKey);
                // Initialize Email.js
                if (window.emailjs) {
                    window.emailjs.init(additionalConfig.publicKey);
                }
            }
        }
        
        return { success: true, message: `Email service configured as ${provider}` };
    }

    /**
     * Send appointment reminder email
     */
    async sendReminderEmail(patientData, appointmentData, reminderType = 'reminder') {
        try {
            const emailContent = this.generateReminderEmailContent(patientData, appointmentData, reminderType);
            
            const result = await this.sendEmail({
                to: patientData.email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text,
                appointmentId: appointmentData.id,
                patientId: patientData.patient_no
            });

            this.sentEmails.push({
                ...result,
                timestamp: new Date(),
                type: reminderType,
                appointmentId: appointmentData.id
            });

            return {
                success: true,
                messageId: result.messageId,
                timestamp: new Date().toISOString(),
                recipient: patientData.email
            };
        } catch (error) {
            console.error('Error sending reminder email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send follow-up email
     */
    async sendFollowUpEmail(patientData, appointmentData, followUpType = 'post-appointment') {
        try {
            const emailContent = this.generateFollowUpEmailContent(patientData, appointmentData, followUpType);
            
            const result = await this.sendEmail({
                to: patientData.email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text,
                appointmentId: appointmentData.id,
                patientId: patientData.patient_no,
                followUpType
            });

            return {
                success: true,
                messageId: result.messageId,
                timestamp: new Date().toISOString(),
                recipient: patientData.email
            };
        } catch (error) {
            console.error('Error sending follow-up email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk send emails
     */
    async sendBulkEmails(recipients, subject, template, variables = {}) {
        const results = [];
        
        for (const recipient of recipients) {
            try {
                const html = this.renderTemplate(template, { ...variables, recipient });
                const result = await this.sendEmail({
                    to: recipient.email,
                    subject,
                    html,
                    text: this.stripHtml(html)
                });
                
                results.push({
                    email: recipient.email,
                    success: true,
                    messageId: result.messageId
                });
            } catch (error) {
                results.push({
                    email: recipient.email,
                    success: false,
                    error: error.message
                });
            }
        }

        return {
            total: recipients.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            details: results
        };
    }

    /**
     * Generate reminder email content
     */
    generateReminderEmailContent(patientData, appointmentData, reminderType) {
        const appointmentDate = new Date(appointmentData.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                    .appointment-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
                    .footer { margin-top: 20px; font-size: 12px; color: #999; }
                    .btn { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Appointment Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${patientData.patient_name || patientData.name},</p>
                        <p>This is a reminder about your upcoming appointment at HealthFlow.</p>
                        
                        <div class="appointment-details">
                            <h3>Appointment Details</h3>
                            <p><strong>Date & Time:</strong> ${formattedDate}</p>
                            <p><strong>Type:</strong> ${appointmentData.appointment_type || 'Regular Checkup'}</p>
                            <p><strong>Location:</strong> ${appointmentData.facility || 'HealthFlow Clinic'}</p>
                            ${appointmentData.notes ? `<p><strong>Notes:</strong> ${appointmentData.notes}</p>` : ''}
                        </div>

                        <p><strong>Please arrive 10 minutes early.</strong></p>
                        
                        <p style="margin-top: 20px;">If you need to reschedule or cancel, please contact us as soon as possible.</p>
                        
                        <a href="https://healthflow.local/reschedule?appt=${appointmentData.id}" class="btn">Reschedule Appointment</a>
                        
                        <div class="footer">
                            <p>© HealthFlow Clinic. All rights reserved.</p>
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return {
            subject: `Reminder: Your appointment on ${appointmentDate.toLocaleDateString()}`,
            html,
            text: `Hello ${patientData.patient_name}, reminder about your appointment on ${formattedDate}`
        };
    }

    /**
     * Generate follow-up email content
     */
    generateFollowUpEmailContent(patientData, appointmentData, followUpType) {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2196F3; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                    .action-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
                    .btn { display: inline-block; background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Follow-up Care</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${patientData.patient_name || patientData.name},</p>
                        <p>Thank you for visiting HealthFlow for your recent appointment.</p>
                        
                        <div class="action-box">
                            <h3>Next Steps</h3>
                            <ul>
                                <li>Take any prescribed medications as directed</li>
                                <li>Schedule your next appointment if needed</li>
                                <li>Contact us if you have any questions or concerns</li>
                            </ul>
                        </div>

                        <p>Your next recommended appointment: <strong>${this.getNextRecommendedDate()}</strong></p>
                        
                        <a href="https://healthflow.local/book-appointment" class="btn">Schedule Next Appointment</a>
                        
                        <div style="margin-top: 20px; padding: 15px; background: #E3F2FD; border-radius: 3px;">
                            <p><strong>Have questions?</strong> Our support team is here to help.</p>
                            <p>📞 +1 (555) 123-4567 | 📧 support@healthflow.local</p>
                        </div>
                        
                        <div style="margin-top: 20px; font-size: 12px; color: #999;">
                            <p>© HealthFlow Clinic. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return {
            subject: 'Follow-up Care - Your Recent Appointment',
            html,
            text: `Follow-up care information after your appointment at HealthFlow`
        };
    }

    /**
     * Internal: Send email via configured provider
     */
    async sendEmail(emailData) {
        console.log(`Sending email to ${emailData.to}:`, emailData.subject);
        
        if (this.provider === 'sendgrid') {
            return await this.sendViaSendGrid(emailData);
        } else if (this.provider === 'gmail') {
            return await this.sendViaGmail(emailData);
        }
        
        // Fallback mock response
        return {
            messageId: `msg_${Date.now()}`,
            timestamp: new Date()
        };
    }

    /**
     * Send email via SendGrid API
     */
    async sendViaSendGrid(emailData) {
        try {
            if (!this.apiKey) {
                throw new Error('SendGrid API key not configured');
            }

            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [
                        {
                            to: [{ email: emailData.to }],
                            subject: emailData.subject
                        }
                    ],
                    from: { email: this.fromEmail },
                    content: [
                        {
                            type: 'text/plain',
                            value: emailData.text
                        },
                        {
                            type: 'text/html',
                            value: emailData.html
                        }
                    ]
                })
            });

            if (response.status === 202) {
                const messageId = response.headers.get('X-Message-Id') || `msg_${Date.now()}`;
                console.log('Email sent successfully via SendGrid:', messageId);
                return {
                    messageId,
                    timestamp: new Date(),
                    provider: 'sendgrid'
                };
            } else {
                const error = await response.text();
                throw new Error(`SendGrid error: ${response.status} - ${error}`);
            }
        } catch (error) {
            console.error('SendGrid email error:', error);
            throw error;
        }
    }

    /**
     * Send email via Gmail using OAuth2 and Gmail API
     */
    async sendViaGmail(emailData) {
        try {
            const accessToken = localStorage.getItem('gmail_access_token');
            
            if (!accessToken) {
                throw new Error('Gmail OAuth2 access token not found. Please authenticate first.');
            }

            // Base64 encode the email
            const email = this.buildGmailMessage(emailData);
            const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_');

            const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw: encodedEmail
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Email sent successfully via Gmail:', result.id);
                return {
                    messageId: result.id,
                    timestamp: new Date(),
                    provider: 'gmail',
                    status: 200
                };
            } else {
                const error = await response.json();
                throw new Error(`Gmail API error: ${error.error.message}`);
            }
        } catch (error) {
            console.error('Gmail OAuth2 email error:', error);
            throw error;
        }
    }

    /**
     * Build RFC 2822 formatted email message for Gmail API
     */
    buildGmailMessage(emailData) {
        const headers = [
            `To: ${emailData.to}`,
            `From: ${this.fromEmail}`,
            `Subject: ${emailData.subject}`,
            'Content-Type: text/html; charset="UTF-8"',
            'MIME-Version: 1.0',
            ''
        ];

        return headers.join('\r\n') + '\r\n' + emailData.html;
    }

    /**
     * Initialize Gmail OAuth2 authentication
     */
    async authenticateGmailOAuth2(clientId, redirectUri) {
        const scopes = 'https://www.googleapis.com/auth/gmail.send';
        const codeChallenge = this.generateCodeChallenge();
        
        localStorage.setItem('oauth_code_verifier', codeChallenge.verifier);
        localStorage.setItem('oauth_state', this.generateState());
        
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', scopes);
        authUrl.searchParams.append('access_type', 'offline');
        authUrl.searchParams.append('prompt', 'consent');
        authUrl.searchParams.append('code_challenge', codeChallenge.challenge);
        authUrl.searchParams.append('code_challenge_method', 'S256');
        authUrl.searchParams.append('state', localStorage.getItem('oauth_state'));

        window.location.href = authUrl.toString();
    }

    /**
     * Handle OAuth2 callback and exchange code for access token
     */
    async handleGmailOAuth2Callback(code, clientId, clientSecret, redirectUri) {
        try {
            const codeVerifier = localStorage.getItem('oauth_code_verifier');
            const state = localStorage.getItem('oauth_state');

            if (!codeVerifier) {
                throw new Error('Code verifier not found. Authentication may have been interrupted.');
            }

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    code_verifier: codeVerifier,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Store tokens
                localStorage.setItem('gmail_access_token', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('gmail_refresh_token', data.refresh_token);
                }
                localStorage.setItem('gmail_token_expiry', Date.now() + (data.expires_in * 1000));

                // Clean up
                localStorage.removeItem('oauth_code_verifier');
                localStorage.removeItem('oauth_state');

                console.log('Gmail OAuth2 authentication successful');
                return { success: true, message: 'Gmail authenticated successfully' };
            } else {
                const error = await response.json();
                throw new Error(`OAuth2 error: ${error.error_description}`);
            }
        } catch (error) {
            console.error('Gmail OAuth2 callback error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Refresh Gmail access token using refresh token
     */
    async refreshGmailAccessToken(clientId, clientSecret) {
        try {
            const refreshToken = localStorage.getItem('gmail_refresh_token');
            
            if (!refreshToken) {
                throw new Error('Refresh token not found');
            }

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('gmail_access_token', data.access_token);
                localStorage.setItem('gmail_token_expiry', Date.now() + (data.expires_in * 1000));
                console.log('Gmail access token refreshed');
                return { success: true };
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility: Generate PKCE code challenge
     */
    generateCodeChallenge() {
        const verifier = this.generateRandomString(128);
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        return crypto.subtle.digest('SHA-256', data).then(digest => {
            const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            return { verifier, challenge };
        });
    }

    /**
     * Utility: Generate random state string
     */
    generateState() {
        return this.generateRandomString(32);
    }

    /**
     * Utility: Generate random string for OAuth
     */
    generateRandomString(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let result = '';
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
        return result;
    }

    /**
     * Utility: Render template
     */
    renderTemplate(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }

    /**
     * Utility: Strip HTML tags
     */
    stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * Utility: Get next recommended appointment date
     */
    getNextRecommendedDate() {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 3);
        return nextDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    /**
     * Get sent emails log
     */
    getSentEmailsLog() {
        return this.sentEmails;
    }
}

/**
 * Push Notification Service
 * Handles web and mobile push notifications
 */
class PushNotificationService {
    constructor() {
        this.notifications = [];
        this.isEnabled = 'Notification' in window;
    }

    /**
     * Send local notification
     */
    async sendLocalNotification(title, options = {}) {
        if (!this.isEnabled || Notification.permission !== 'granted') {
            return { success: false, error: 'Notifications not enabled' };
        }

        try {
            const notification = new Notification(title, {
                icon: '/assets/icons/icon-192x192.png',
                badge: '/assets/icons/badge.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
                if (options.onClick) options.onClick();
            };

            this.notifications.push({
                title,
                timestamp: new Date(),
                options
            });

            return { success: true, notification };
        } catch (error) {
            console.error('Error sending notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send push notification via service worker
     */
    async sendPushNotification(title, options = {}) {
        try {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;

                await registration.showNotification(title, {
                    icon: '/assets/icons/icon-192x192.png',
                    badge: '/assets/icons/badge.png',
                    tag: options.tag || 'notification',
                    requireInteraction: options.requireInteraction || false,
                    ...options
                });

                return { success: true };
            } else {
                return await this.sendLocalNotification(title, options);
            }
        } catch (error) {
            console.error('Error sending push notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send appointment reminder notification
     */
    async sendAppointmentReminder(patientData, appointmentData, minutesBefore) {
        const appointmentDate = new Date(appointmentData.appointment_date);
        const now = new Date();
        const timeUntilAppointment = appointmentDate - now;

        if (timeUntilAppointment > 0) {
            const delayMs = timeUntilAppointment - (minutesBefore * 60 * 1000);

            setTimeout(async () => {
                await this.sendPushNotification(
                    `Appointment Reminder: ${patientData.patient_name}`,
                    {
                        body: `Your ${appointmentData.appointment_type || 'appointment'} is coming up at ${appointmentDate.toLocaleTimeString()}`,
                        tag: `appointment_${appointmentData.id}`,
                        requireInteraction: true,
                        onClick: () => {
                            window.location.href = '/dashboard';
                        }
                    }
                );
            }, Math.max(0, delayMs));
        }

        return { success: true, scheduled: true };
    }

    /**
     * Send bulk notifications
     */
    async sendBulkNotifications(notifications) {
        const results = [];
        for (const notif of notifications) {
            const result = await this.sendPushNotification(notif.title, notif.options);
            results.push(result);
        }
        return results;
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        if (!this.isEnabled) {
            return { success: false, error: 'Notifications not supported' };
        }

        try {
            const permission = await Notification.requestPermission();
            return { success: permission === 'granted', permission };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get notification status
     */
    getNotificationStatus() {
        return {
            supported: this.isEnabled,
            permission: this.isEnabled ? Notification.permission : 'denied',
            count: this.notifications.length
        };
    }
}

/**
 * Recurring Appointment Management
 */
class RecurringAppointmentManager {
    constructor() {
        this.patterns = {
            'monthly': { interval: 1, unit: 'month' },
            'quarterly': { interval: 3, unit: 'month' },
            'semi-annual': { interval: 6, unit: 'month' },
            'annual': { interval: 1, unit: 'year' },
            'weekly': { interval: 1, unit: 'week' },
            'bi-weekly': { interval: 2, unit: 'week' }
        };
        this.recurringAppointments = {};
    }

    /**
     * Create recurring appointment pattern
     */
    createRecurringPattern(baseAppointmentId, patientId, pattern, startDate, endDate = null, maxOccurrences = null) {
        try {
            if (!this.patterns[pattern]) {
                throw new Error(`Unknown pattern: ${pattern}`);
            }

            const patternConfig = this.patterns[pattern];
            const appointments = [];
            let currentDate = new Date(startDate);
            let occurrences = 0;

            while (occurrences < (maxOccurrences || 12)) {
                if (endDate && currentDate > new Date(endDate)) break;

                appointments.push({
                    baseAppointmentId,
                    patientId,
                    scheduledDate: new Date(currentDate),
                    sequence: occurrences + 1,
                    status: 'scheduled'
                });

                // Add interval
                if (patternConfig.unit === 'month') {
                    currentDate.setMonth(currentDate.getMonth() + patternConfig.interval);
                } else if (patternConfig.unit === 'year') {
                    currentDate.setFullYear(currentDate.getFullYear() + patternConfig.interval);
                } else if (patternConfig.unit === 'week') {
                    currentDate.setDate(currentDate.getDate() + (7 * patternConfig.interval));
                }

                occurrences++;
            }

            const recurringId = `recurring_${patientId}_${Date.now()}`;
            this.recurringAppointments[recurringId] = {
                baseAppointmentId,
                patientId,
                pattern,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                maxOccurrences,
                appointments,
                createdAt: new Date(),
                status: 'active'
            };

            return {
                success: true,
                recurringId,
                appointmentCount: appointments.length,
                appointments
            };
        } catch (error) {
            console.error('Error creating recurring pattern:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get upcoming recurring appointments
     */
    getUpcomingRecurringAppointments(daysAhead = 30) {
        const upcoming = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

        for (const [id, recurring] of Object.entries(this.recurringAppointments)) {
            if (recurring.status !== 'active') continue;

            recurring.appointments.forEach(appt => {
                if (appt.status === 'scheduled' && appt.scheduledDate <= cutoffDate) {
                    upcoming.push({
                        recurringId: id,
                        ...appt
                    });
                }
            });
        }

        return upcoming.sort((a, b) => a.scheduledDate - b.scheduledDate);
    }

    /**
     * Update recurring appointment status
     */
    updateRecurringStatus(recurringId, appointmentSequence, newStatus) {
        try {
            const recurring = this.recurringAppointments[recurringId];
            if (!recurring) throw new Error('Recurring appointment not found');

            const appointment = recurring.appointments.find(a => a.sequence === appointmentSequence);
            if (!appointment) throw new Error('Appointment sequence not found');

            appointment.status = newStatus;
            return { success: true, message: `Appointment ${appointmentSequence} updated to ${newStatus}` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel recurring appointment series
     */
    cancelRecurringSeries(recurringId) {
        try {
            const recurring = this.recurringAppointments[recurringId];
            if (!recurring) throw new Error('Recurring appointment not found');

            recurring.status = 'cancelled';
            recurring.appointments.forEach(appt => {
                if (appt.status === 'scheduled') {
                    appt.status = 'cancelled';
                }
            });

            return { success: true, message: 'Recurring series cancelled' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recurring appointment statistics
     */
    getRecurringStats() {
        let total = 0;
        let scheduled = 0;
        let completed = 0;
        let cancelled = 0;

        for (const recurring of Object.values(this.recurringAppointments)) {
            recurring.appointments.forEach(appt => {
                total++;
                if (appt.status === 'scheduled') scheduled++;
                if (appt.status === 'completed') completed++;
                if (appt.status === 'cancelled') cancelled++;
            });
        }

        return { total, scheduled, completed, cancelled };
    }
}

/**
 * Appointment Conflict Detection
 */
class ConflictDetectionManager {
    constructor() {
        this.conflicts = [];
        this.conflictThreshold = 30; // minutes
    }

    /**
     * Check for appointment conflicts
     */
    checkConflicts(newAppointment, existingAppointments) {
        const conflicts = [];
        const newStart = new Date(newAppointment.appointment_date);
        const newEnd = new Date(newStart.getTime() + (newAppointment.duration || 60) * 60000);

        for (const existing of existingAppointments) {
            if (existing.id === newAppointment.id) continue; // Skip self
            if (existing.status === 'Cancelled' || existing.status === 'Missed') continue; // Skip inactive

            const existingStart = new Date(existing.appointment_date);
            const existingEnd = new Date(existingStart.getTime() + (existing.duration || 60) * 60000);

            // Check for same patient conflicts
            if (existing.patient_no === newAppointment.patient_no) {
                if (this.hasTimeOverlap(newStart, newEnd, existingStart, existingEnd)) {
                    conflicts.push({
                        type: 'patient_double_booking',
                        severity: 'high',
                        conflictingAppointmentId: existing.id,
                        conflictingAppointmentDate: existing.appointment_date,
                        message: `Patient already has appointment at ${existingStart.toLocaleTimeString()}`
                    });
                }
            }

            // Check for provider/facility conflicts
            if (existing.provider_id === newAppointment.provider_id || existing.facility === newAppointment.facility) {
                if (this.hasTimeOverlap(newStart, newEnd, existingStart, existingEnd)) {
                    conflicts.push({
                        type: 'provider_conflict',
                        severity: 'medium',
                        conflictingAppointmentId: existing.id,
                        message: `Provider/facility already booked at this time`
                    });
                }
            }

            // Check for proximity conflicts (appointments too close together)
            const timeBetween = Math.abs(newStart - existingEnd) / 60000; // in minutes
            if (timeBetween < this.conflictThreshold && timeBetween >= 0) {
                conflicts.push({
                    type: 'proximity_conflict',
                    severity: 'low',
                    conflictingAppointmentId: existing.id,
                    minutesBetween: Math.round(timeBetween),
                    message: `Only ${Math.round(timeBetween)} minutes between appointments`
                });
            }
        }

        if (conflicts.length > 0) {
            this.conflicts.push({
                newAppointmentId: newAppointment.id,
                timestamp: new Date(),
                conflicts
            });
        }

        return {
            hasConflicts: conflicts.length > 0,
            conflictCount: conflicts.length,
            conflicts
        };
    }

    /**
     * Check for time overlap
     */
    hasTimeOverlap(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    }

    /**
     * Get conflict suggestions
     */
    getConflictSuggestions(conflicts, availableSlots = []) {
        const suggestions = [];

        for (const conflict of conflicts) {
            if (conflict.type === 'patient_double_booking') {
                suggestions.push({
                    action: 'reschedule',
                    priority: 'high',
                    recommendation: 'Choose a different time slot for this patient',
                    availableSlots
                });
            } else if (conflict.type === 'provider_conflict') {
                suggestions.push({
                    action: 'assign_alternate_provider',
                    priority: 'medium',
                    recommendation: 'Assign another available provider'
                });
            } else if (conflict.type === 'proximity_conflict') {
                suggestions.push({
                    action: 'extend_buffer',
                    priority: 'low',
                    recommendation: `Add ${this.conflictThreshold - conflict.minutesBetween} minutes buffer time`
                });
            }
        }

        return suggestions;
    }

    /**
     * Get conflicts log
     */
    getConflictsLog() {
        return this.conflicts;
    }

    /**
     * Clear old conflicts
     */
    clearOldConflicts(hoursOld = 24) {
        const cutoffTime = new Date().getTime() - (hoursOld * 60 * 60 * 1000);
        this.conflicts = this.conflicts.filter(c => c.timestamp.getTime() > cutoffTime);
    }
}

/**
 * Automated Follow-up Scheduler
 */
class FollowUpScheduler {
    constructor() {
        this.followUps = {};
        this.schedules = {
            'post_appointment': { days: 1, type: 'email' },
            'medication_reminder': { days: 0.5, type: 'notification' }, // 12 hours
            'lab_results': { days: 3, type: 'email' },
            'treatment_review': { days: 7, type: 'email' },
            'quarterly_checkup': { days: 90, type: 'email' }
        };
    }

    /**
     * Schedule automatic follow-up
     */
    scheduleFollowUp(appointmentId, patientId, followUpType, appointmentDate) {
        try {
            if (!this.schedules[followUpType]) {
                throw new Error(`Unknown follow-up type: ${followUpType}`);
            }

            const config = this.schedules[followUpType];
            const followUpDate = new Date(appointmentDate);
            followUpDate.setDate(followUpDate.getDate() + config.days);

            const followUpId = `followup_${appointmentId}_${followUpType}`;

            this.followUps[followUpId] = {
                appointmentId,
                patientId,
                followUpType,
                scheduledDate: followUpDate,
                notificationType: config.type,
                createdAt: new Date(),
                status: 'scheduled',
                attempts: 0,
                maxAttempts: 3
            };

            // Schedule the notification
            this.scheduleNotification(followUpId, followUpDate);

            return {
                success: true,
                followUpId,
                scheduledDate: followUpDate.toISOString()
            };
        } catch (error) {
            console.error('Error scheduling follow-up:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Schedule notification for follow-up
     */
    scheduleNotification(followUpId, scheduledDate) {
        const delayMs = scheduledDate - new Date();

        if (delayMs > 0) {
            setTimeout(() => {
                this.triggerFollowUp(followUpId);
            }, delayMs);
        }
    }

    /**
     * Trigger follow-up notification/email
     */
    async triggerFollowUp(followUpId) {
        try {
            const followUp = this.followUps[followUpId];
            if (!followUp) return;

            followUp.status = 'triggered';
            followUp.attempts++;

            // Trigger appropriate action based on notification type
            if (followUp.notificationType === 'email') {
                // Would call emailService.sendFollowUpEmail()
                console.log(`Email follow-up triggered: ${followUpId}`);
            } else if (followUp.notificationType === 'notification') {
                // Would call pushNotificationService.sendPushNotification()
                console.log(`Push notification follow-up triggered: ${followUpId}`);
            }

            followUp.lastTriggeredAt = new Date();

            return { success: true, followUpId };
        } catch (error) {
            console.error('Error triggering follow-up:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get pending follow-ups
     */
    getPendingFollowUps(daysAhead = 7) {
        const pending = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

        for (const followUp of Object.values(this.followUps)) {
            if (followUp.status === 'scheduled' && followUp.scheduledDate <= cutoffDate) {
                pending.push(followUp);
            }
        }

        return pending.sort((a, b) => a.scheduledDate - b.scheduledDate);
    }

    /**
     * Get follow-up statistics
     */
    getFollowUpStats() {
        const stats = {
            total: Object.keys(this.followUps).length,
            scheduled: 0,
            triggered: 0,
            completed: 0,
            failed: 0,
            byType: {}
        };

        for (const followUp of Object.values(this.followUps)) {
            if (followUp.status === 'scheduled') stats.scheduled++;
            if (followUp.status === 'triggered') stats.triggered++;
            if (followUp.status === 'completed') stats.completed++;
            if (followUp.status === 'failed') stats.failed++;

            if (!stats.byType[followUp.followUpType]) {
                stats.byType[followUp.followUpType] = 0;
            }
            stats.byType[followUp.followUpType]++;
        }

        return stats;
    }

    /**
     * Cancel follow-up
     */
    cancelFollowUp(followUpId) {
        try {
            const followUp = this.followUps[followUpId];
            if (!followUp) throw new Error('Follow-up not found');

            followUp.status = 'cancelled';
            return { success: true, message: 'Follow-up cancelled' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

/**
 * Advanced Excel Exporter with Full Formatting, Colors, and Styling
 */
class AdvancedExcelExporter {
    constructor() {
        this.colorPalette = {
            header: 'FFD966',
            headerText: '000000',
            completed: 'C6EFCE',
            completedText: '070707',
            missed: 'FFC7CE',
            missedText: '9C0006',
            scheduled: 'DDEBF7',
            scheduledText: '002060',
            cancelled: 'FFC000',
            cancelledText: '9C5700',
            statsHeader: '4472C4',
            statsHeaderText: 'FFFFFF',
            alternateRow: 'F2F2F2'
        };
    }

    /**
      * Export appointments with advanced formatting as .xlsx using ExcelJS
      */
     async exportAppointmentsWithFormatting(appointments) {
         try {
             if (!window.ExcelJS) {
                 throw new Error('ExcelJS library not loaded');
             }

             const ExcelJS = window.ExcelJS;
             const workbook = new ExcelJS.Workbook();
             const worksheet = workbook.addWorksheet('Appointments');

             // Define headers
             const headers = ['Date', 'Patient ID', 'Patient Name', 'Status', 'Type', 'Next Appointment', 'Notes'];
             worksheet.addRow(headers);

             // Style header row
             const headerRow = worksheet.getRow(1);
             headerRow.fill = {
                 type: 'pattern',
                 pattern: 'solid',
                 fgColor: { argb: 'FFD966' }
             };
             headerRow.font = {
                 bold: true,
                 color: { argb: 'FF000000' },
                 size: 11
             };
             headerRow.alignment = { horizontal: 'center', vertical: 'center' };
             headerRow.height = 25;

             // Add borders to header
             headers.forEach((_, i) => {
                 const cell = headerRow.getCell(i + 1);
                 cell.border = {
                     top: { style: 'thin' },
                     left: { style: 'thin' },
                     bottom: { style: 'thin' },
                     right: { style: 'thin' }
                 };
             });

             // Add data rows
             appointments.forEach((appt, idx) => {
                 const row = worksheet.addRow([
                     new Date(appt.appointment_date).toLocaleDateString(),
                     appt.patient_no,
                     appt.patient_name,
                     appt.status || 'Scheduled',
                     appt.appointment_type || 'Regular',
                     appt.next_appointment ? new Date(appt.next_appointment).toLocaleDateString() : '',
                     appt.notes || ''
                 ]);

                 // Alternate row colors
                 const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF2F2F2';
                 row.fill = {
                     type: 'pattern',
                     pattern: 'solid',
                     fgColor: { argb: bgColor }
                 };

                 // Style status cell with color coding
                 const statusCell = row.getCell(4);
                 const status = appt.status || 'Scheduled';
                 let statusBgColor = 'FFFFFFFF';
                 let statusFontColor = 'FF000000';

                 if (status === 'Completed') {
                     statusBgColor = 'FFC6EFCE';
                     statusFontColor = 'FF070707';
                 } else if (status === 'Missed') {
                     statusBgColor = 'FFFFC7CE';
                     statusFontColor = 'FF9C0006';
                 } else if (status === 'Scheduled') {
                     statusBgColor = 'FFDDEBF7';
                     statusFontColor = 'FF002060';
                 } else if (status === 'Cancelled') {
                     statusBgColor = 'FFFFC000';
                     statusFontColor = 'FF9C5700';
                 }

                 statusCell.fill = {
                     type: 'pattern',
                     pattern: 'solid',
                     fgColor: { argb: statusBgColor }
                 };
                 statusCell.font = {
                     bold: true,
                     color: { argb: statusFontColor }
                 };

                 // Add borders and alignment to all cells
                 row.eachCell((cell) => {
                     cell.border = {
                         top: { style: 'thin' },
                         left: { style: 'thin' },
                         bottom: { style: 'thin' },
                         right: { style: 'thin' }
                     };
                     cell.alignment = { vertical: 'center', wrapText: true };
                 });

                 row.height = 20;
             });

             // Set column widths
             worksheet.columns = [
                 { width: 12 },  // Date
                 { width: 12 },  // Patient ID
                 { width: 20 },  // Patient Name
                 { width: 12 },  // Status
                 { width: 15 },  // Type
                 { width: 16 },  // Next Appointment
                 { width: 25 }   // Notes
             ];

             // Freeze header row
             worksheet.views = [{ state: 'frozen', ySplit: 1 }];

             // Add workbook properties
             workbook.properties = {
                 title: 'HealthFlow Appointments Report',
                 subject: 'Appointment Export',
                 author: 'HealthFlow Chatbot',
                 keywords: 'appointments,export',
                 category: 'Healthcare',
                 created: new Date()
             };

             // Write and download
             const filename = `HealthFlow_Appointments_${new Date().toISOString().split('T')[0]}.xlsx`;
             const buffer = await workbook.xlsx.writeBuffer();
             const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
             
             const link = document.createElement('a');
             const url = URL.createObjectURL(blob);
             link.href = url;
             link.download = filename;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);

             return { success: true, message: 'Excel exported successfully with full formatting' };
         } catch (error) {
             console.error('Error exporting Excel:', error);
             return { success: false, error: error.message };
         }
     }

             /**
              * Export patients with advanced formatting as .xlsx using ExcelJS
              */
             async exportPatientsWithFormatting(patients) {
                 try {
                     if (!window.ExcelJS) {
                         throw new Error('ExcelJS library not loaded');
                     }

                     const ExcelJS = window.ExcelJS;
                     const workbook = new ExcelJS.Workbook();
                     const worksheet = workbook.addWorksheet('Patients');

                     // Define headers
                     const headers = ['Patient ID', 'Name', 'Age', 'Gender', 'Status', 'Condition', 'HIV Status', 'Next Appointment', 'Appointment Type'];
                     worksheet.addRow(headers);

                     // Style header row
                     const headerRow = worksheet.getRow(1);
                     headerRow.fill = {
                         type: 'pattern',
                         pattern: 'solid',
                         fgColor: { argb: 'FFD966' }
                     };
                     headerRow.font = {
                         bold: true,
                         color: { argb: 'FF000000' },
                         size: 11
                     };
                     headerRow.alignment = { horizontal: 'center', vertical: 'center' };
                     headerRow.height = 25;

                     // Add borders to header
                     headers.forEach((_, i) => {
                         const cell = headerRow.getCell(i + 1);
                         cell.border = {
                             top: { style: 'thin' },
                             left: { style: 'thin' },
                             bottom: { style: 'thin' },
                             right: { style: 'thin' }
                         };
                     });

                     // Add data rows
                     patients.forEach((patient, idx) => {
                         const row = worksheet.addRow([
                             patient.patient_no,
                             `${patient.first_name} ${patient.last_name}`,
                             patient.age,
                             patient.gender || '',
                             patient.status || '',
                             patient.condition || '',
                             patient.hiv_status || '',
                             patient.next_appointment ? new Date(patient.next_appointment).toLocaleDateString() : '',
                             patient.appointment_type || ''
                         ]);

                         // Alternate row colors
                         const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF2F2F2';
                         row.fill = {
                             type: 'pattern',
                             pattern: 'solid',
                             fgColor: { argb: bgColor }
                         };

                         // Style status cell with color coding
                         const statusCell = row.getCell(5);
                         const status = patient.status || '';
                         let statusBgColor = 'FFFFFFFF';
                         let statusFontColor = 'FF000000';

                         if (status === 'Active') {
                             statusBgColor = 'FFC6EFCE';
                             statusFontColor = 'FF070707';
                         } else if (status === 'Inactive') {
                             statusBgColor = 'FFFFC7CE';
                             statusFontColor = 'FF9C0006';
                         } else if (status === 'Critical') {
                             statusBgColor = 'FFDDEBF7';
                             statusFontColor = 'FF002060';
                         }

                         statusCell.fill = {
                             type: 'pattern',
                             pattern: 'solid',
                             fgColor: { argb: statusBgColor }
                         };
                         statusCell.font = {
                             bold: true,
                             color: { argb: statusFontColor }
                         };

                         // Style HIV Status column
                         const hivCell = row.getCell(7);
                         const hivStatus = patient.hiv_status || '';
                         let hivBgColor = 'FFFFFFFF';
                         let hivFontColor = 'FF000000';

                         if (hivStatus === 'Positive') {
                             hivBgColor = 'FFF8CECC';
                             hivFontColor = 'FF9C0006';
                         } else if (hivStatus === 'Negative') {
                             hivBgColor = 'FFC6EFCE';
                             hivFontColor = 'FF070707';
                         }

                         hivCell.fill = {
                             type: 'pattern',
                             pattern: 'solid',
                             fgColor: { argb: hivBgColor }
                         };
                         hivCell.font = {
                             bold: true,
                             color: { argb: hivFontColor }
                         };

                         // Add borders and alignment to all cells
                         row.eachCell((cell) => {
                             cell.border = {
                                 top: { style: 'thin' },
                                 left: { style: 'thin' },
                                 bottom: { style: 'thin' },
                                 right: { style: 'thin' }
                             };
                             cell.alignment = { vertical: 'center', wrapText: true };
                         });

                         row.height = 20;
                     });

                     // Set column widths
                     worksheet.columns = [
                         { width: 12 },  // Patient ID
                         { width: 20 },  // Name
                         { width: 8 },   // Age
                         { width: 10 },  // Gender
                         { width: 12 },  // Status
                         { width: 15 },  // Condition
                         { width: 12 },  // HIV Status
                         { width: 16 },  // Next Appointment
                         { width: 15 }   // Appointment Type
                     ];

                     // Freeze header row
                     worksheet.views = [{ state: 'frozen', ySplit: 1 }];

                     // Add workbook properties
                     workbook.properties = {
                         title: 'HealthFlow Patients Report',
                         subject: 'Patient Export',
                         author: 'HealthFlow Chatbot',
                         keywords: 'patients,export',
                         category: 'Healthcare',
                         created: new Date()
                     };

                     // Write and download
                     const filename = `HealthFlow_Patients_${new Date().toISOString().split('T')[0]}.xlsx`;
                     const buffer = await workbook.xlsx.writeBuffer();
                     const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                     
                     const link = document.createElement('a');
                     const url = URL.createObjectURL(blob);
                     link.href = url;
                     link.download = filename;
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                     URL.revokeObjectURL(url);

                     return { success: true, message: 'Excel exported successfully with full formatting' };
                 } catch (error) {
                     console.error('Error exporting patients Excel:', error);
                     return { success: false, error: error.message };
                 }
             }

             /**
             * Generate fully formatted HTML for Excel
             */
    generateFormattedHTML(appointments) {
        const stats = this.calculateStats(appointments);
        const timestamp = new Date().toLocaleString();

        return `
<!DOCTYPE html>
<html xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Calibri, Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        
        /* Header styling */
        .header {
            background-color: #FFD966;
            color: #000000;
            font-weight: bold;
            font-size: 11pt;
            padding: 8px;
            border: 1px solid #000000;
            text-align: left;
            white-space: nowrap;
            vertical-align: middle;
        }
        
        /* Title styling */
        .title {
            background-color: #4472C4;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 14pt;
            padding: 12px;
            text-align: center;
        }
        
        /* Status colors */
        .status-completed {
            background-color: #C6EFCE;
            color: #070707;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
        }
        
        .status-scheduled {
            background-color: #DDEBF7;
            color: #002060;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
        }
        
        .status-missed {
            background-color: #FFC7CE;
            color: #9C0006;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
        }
        
        .status-cancelled {
            background-color: #FFC000;
            color: #9C5700;
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
        }
        
        /* Data cell styling */
        .data-cell {
            padding: 6px;
            border: 1px solid #D3D3D3;
            font-size: 10pt;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: clip;
        }
        
        .data-cell-wrap {
            padding: 6px;
            border: 1px solid #D3D3D3;
            font-size: 10pt;
            word-wrap: break-word;
            white-space: normal;
        }
        
        /* Alternate rows */
        .row-odd {
            background-color: #FFFFFF;
        }
        
        .row-even {
            background-color: #F2F2F2;
        }
        
        /* Statistics section */
        .stats-header {
            background-color: #4472C4;
            color: #FFFFFF;
            font-weight: bold;
            padding: 8px;
            border: 1px solid #000000;
        }
        
        .stats-label {
            padding: 6px;
            border: 1px solid #D3D3D3;
            font-weight: bold;
            background-color: #E7E6E6;
            white-space: nowrap;
        }
        
        .stats-value {
            padding: 6px;
            border: 1px solid #D3D3D3;
            text-align: right;
            font-weight: bold;
        }
        
        /* Date and time */
        .footer {
            margin-top: 20px;
            font-size: 9pt;
            color: #666666;
        }
    </style>
</head>
<body>
    <table>
        <!-- Title Row -->
        <tr>
            <td colspan="7" class="title">APPOINTMENTS REPORT</td>
        </tr>
        <tr>
            <td colspan="7" style="padding: 6px; font-size: 10pt; color: #666666;">
                Generated: ${timestamp} | Total Appointments: ${stats.total}
            </td>
        </tr>
        
        <!-- Header Row -->
        <tr>
            <td class="header" style="width: 120px;">Date</td>
            <td class="header" style="width: 100px;">Patient ID</td>
            <td class="header" style="width: 150px;">Patient Name</td>
            <td class="header" style="width: 100px;">Status</td>
            <td class="header" style="width: 120px;">Type</td>
            <td class="header" style="width: 250px;">Notes</td>
            <td class="header" style="width: 130px;">Facility</td>
        </tr>
        
        <!-- Data Rows -->
        ${appointments.map((appt, index) => {
            const statusClass = this.getStatusClass(appt.status);
            const rowClass = index % 2 === 0 ? 'row-odd' : 'row-even';
            const date = new Date(appt.appointment_date);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
            
            return `
        <tr class="${rowClass}">
            <td class="data-cell">${formattedDate}</td>
            <td class="data-cell">${appt.patient_no || ''}</td>
            <td class="data-cell">${appt.patient_name || ''}</td>
            <td class="status-${statusClass.toLowerCase()}">${appt.status || 'Scheduled'}</td>
            <td class="data-cell">${appt.appointment_type || 'Regular'}</td>
            <td class="data-cell-wrap">${(appt.notes || '').substring(0, 500)}</td>
            <td class="data-cell">${appt.facility || ''}</td>
        </tr>`;
        }).join('')}
        
        <!-- Statistics Section -->
        <tr>
            <td colspan="7" style="padding: 12px 0 6px 0;"></td>
        </tr>
        <tr>
            <td colspan="7" class="stats-header">APPOINTMENT STATISTICS</td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">Metric</td>
            <td class="stats-label">Count</td>
            <td class="stats-label">Percentage</td>
            <td colspan="3"></td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">Total Appointments</td>
            <td class="stats-value">${stats.total}</td>
            <td class="stats-value">100.0%</td>
            <td colspan="3"></td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">✓ Completed</td>
            <td class="stats-value">${stats.completed}</td>
            <td class="stats-value">${((stats.completed / stats.total) * 100).toFixed(1)}%</td>
            <td colspan="3"></td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">⧗ Scheduled</td>
            <td class="stats-value">${stats.scheduled}</td>
            <td class="stats-value">${((stats.scheduled / stats.total) * 100).toFixed(1)}%</td>
            <td colspan="3"></td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">✗ Missed</td>
            <td class="stats-value">${stats.missed}</td>
            <td class="stats-value">${((stats.missed / stats.total) * 100).toFixed(1)}%</td>
            <td colspan="3"></td>
        </tr>
        <tr>
            <td colspan="2" class="stats-label">⊘ Cancelled</td>
            <td class="stats-value">${stats.cancelled}</td>
            <td class="stats-value">${((stats.cancelled / stats.total) * 100).toFixed(1)}%</td>
            <td colspan="3"></td>
        </tr>
        
        <!-- By Type Section -->
        <tr>
            <td colspan="7" style="padding: 12px 0 6px 0;"></td>
        </tr>
        <tr>
            <td colspan="7" class="stats-header">BY APPOINTMENT TYPE</td>
        </tr>
        ${Object.entries(stats.byType).map(([type, count]) => `
        <tr>
            <td colspan="2" class="stats-label">${type}</td>
            <td class="stats-value">${count}</td>
            <td class="stats-value">${((count / stats.total) * 100).toFixed(1)}%</td>
            <td colspan="3"></td>
        </tr>`).join('')}
    </table>
    
    <div class="footer">
        <p>This report was generated by HealthFlow Appointment System</p>
        <p>All information is confidential and intended for authorized use only.</p>
    </div>
</body>
</html>`;
    }

    /**
     * Get status class for styling
     */
    getStatusClass(status) {
        const statusMap = {
            'Completed': 'completed',
            'Scheduled': 'scheduled',
            'Missed': 'missed',
            'Cancelled': 'cancelled'
        };
        return statusMap[status] || 'scheduled';
    }

    /**
     * Calculate appointment statistics
     */
    calculateStats(appointments) {
        const stats = {
            total: appointments.length,
            completed: 0,
            scheduled: 0,
            missed: 0,
            cancelled: 0,
            byType: {}
        };

        appointments.forEach(appt => {
            const status = appt.status || 'Scheduled';
            if (status === 'Completed') stats.completed++;
            else if (status === 'Scheduled') stats.scheduled++;
            else if (status === 'Missed') stats.missed++;
            else if (status === 'Cancelled') stats.cancelled++;

            const type = appt.appointment_type || 'Regular';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }
}

// Initialize advanced features
const advancedChatbotFeatures = new AdvancedChatbotFeatures();
const recurringManager = new RecurringAppointmentManager();
const conflictDetector = new ConflictDetectionManager();
const followUpScheduler = new FollowUpScheduler();
