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
            "Show patients with viral load detectable",
            "Appointments from last 30 days",
            "Show patient trends"
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
         // Create overlay
         const overlay = document.createElement('div');
         overlay.className = 'chatbot-overlay';
         overlay.id = 'chatbot-overlay';
         overlay.addEventListener('click', () => this.close());
         document.body.appendChild(overlay);
         this.overlay = overlay;

         // Create FAB button
         const fabBtn = document.createElement('button');
         fabBtn.className = 'chatbot-fab';
         fabBtn.innerHTML = '<span class="chatbot-fab-icon">💬</span>';
         fabBtn.id = 'chatbot-fab';
         fabBtn.title = 'HealthFlow AI Assistant';
         fabBtn.setAttribute('aria-label', 'Open HealthFlow AI Assistant');
         document.body.appendChild(fabBtn);

         // Create chatbot container with 3-column layout
         const container = document.createElement('div');
         container.className = 'chatbot-container hidden';
         container.id = 'chatbot-container';
         container.innerHTML = `
       <div class="chatbot-main">
         <!-- Left Sidebar: Quick Questions -->
         <div class="chatbot-sidebar-left">
           <div class="chatbot-sidebar-header">
             <h4>Quick Questions</h4>
           </div>
           <div class="chatbot-quick-questions" id="chatbot-quick-questions">
             <!-- Quick questions will be populated here -->
           </div>
         </div>

         <!-- Middle: Messages Area -->
         <div class="chatbot-center">
           <div class="chatbot-header">
             <div class="chatbot-header-left">
               <h3 class="chatbot-header-title">
                 <span class="chatbot-header-icon">🤖</span>
                 HealthFlow AI Assistant
               </h3>
             </div>
             <button class="chatbot-close-btn" id="chatbot-close-btn" title="Close">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" style="width: 20px; height: 20px;"><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
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
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" style="width: 18px; height: 18px;"><path d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"/></svg>
             </button>
           </div>
         </div>

         <!-- Right Sidebar: AI Info -->
         <div class="chatbot-sidebar-right">
           <div class="chatbot-sidebar-header">
             <h4>About AI Assistant</h4>
           </div>
           <div class="chatbot-ai-info">
             <div class="chatbot-info-item">
               <h5>Capabilities</h5>
               <ul>
                 <li>Patient data search</li>
                 <li>Health analytics</li>
                 <li>Appointment info</li>
                 <li>Data export</li>
               </ul>
             </div>
             <div class="chatbot-info-item">
               <h5>Tips</h5>
               <ul>
                 <li>Use clear questions</li>
                 <li>Specify time periods</li>
                 <li>Ask for summaries</li>
                 <li>Request exports</li>
               </ul>
             </div>
           </div>
         </div>
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
      <div style="padding: 20px; text-align: center;">
        <p style="font-size: 16px; font-weight: 600; color: #1f2937;">👋 Welcome to HealthFlow AI Assistant!</p>
        <p style="font-size: 14px; color: #4b5563; margin-top: 8px;">Ask me about patient data, health conditions, appointments, and more.</p>
        <p style="font-size: 12px; color: #a0aec0; margin-top: 16px;">Database: ${dbConnected}</p>
      </div>
    `;

        this.addMessage(welcomeHTML, 'bot');
        this.populateQuickQuestions();
        console.log('Chatbot initialized. Supabase client:', typeof window.supabaseClient);
    }

    /**
     * Populate quick questions in left sidebar
     */
    populateQuickQuestions() {
        const container = document.getElementById('chatbot-quick-questions');
        if (!container) return;

        const questions = [
            'Show HIV positive patients',
            'List critical patients',
            'Patient appointments today',
            'Health statistics',
            'Recent admissions',
            'Treatment summaries'
        ];

        container.innerHTML = questions.map(q => `
            <div class="chatbot-quick-question" onclick="chatbotUI.sendMessage('${q}')">
                ${q}
            </div>
        `).join('');
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

            // Add quick actions if results were found (but not for error/no results messages)
            if (!response.includes('Error') && !response.includes('No patients found')) {
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
        <button class="chatbot-action-btn chatbot-action-save" onclick="chatbotUI.promptSaveSearch('${lastQuery.replace(/'/g, "\\'")}')">
          <span class="action-icon">💾</span>
          <span class="action-text">Save Search</span>
        </button>
        <button class="chatbot-action-btn chatbot-action-history" onclick="chatbotUI.showSavedSearches()">
          <span class="action-icon">📋</span>
          <span class="action-text">My Searches</span>
        </button>
        <button class="chatbot-action-btn chatbot-action-export" onclick="chatbotUI.exportResults()">
          <span class="action-icon">📥</span>
          <span class="action-text">Export</span>
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
        if (searchName && searchName.trim()) {
            const result = healthFlowChatbot.saveSearch(searchName.trim(), this.lastFilters);
            if (result.success) {
                this.addMessage(`✅ Saved as "${searchName.trim()}"`, 'bot', false);
            } else {
                this.addMessage(`❌ ${result.message}`, 'bot', false);
            }
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
     * Export results as Excel or PDF
     */
    exportResults() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';
        contentDiv.innerHTML = `
      <div style="margin-bottom: 10px;">
        <p style="margin-bottom: 14px; font-weight: 600; color: #333;">Choose export format:</p>
        <div class="chatbot-export-buttons">
          <button onclick="chatbotUI.exportToExcel()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <span>📊</span>
            <span>Download Excel</span>
          </button>
          <button onclick="chatbotUI.exportToPDF()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
            <span>📄</span>
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    `;

        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Export results to Excel with formatting
     */
    async exportToExcel() {
        try {
            this.addMessage('⏳ Preparing Excel file...', 'bot', false);
            
            const results = healthFlowChatbot.lastQueryResults || [];
            if (!results || results.length === 0) {
                this.addMessage('❌ No data to export', 'bot', false);
                return;
            }

            // Dynamically load ExcelJS library
            if (typeof ExcelJS === 'undefined') {
                await this.loadExcelJS();
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Export');

            // Get headers from first row
            const headers = Object.keys(results[0]);
            
            // Add headers with styling
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF15696B' }
            };
            headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: false };
            
            // Set column widths and disable text wrapping
            headers.forEach((header, index) => {
                const column = worksheet.getColumn(index + 1);
                column.width = Math.min(25, Math.max(12, header.length + 2));
                column.alignment = { wrapText: false };
            });

            // Add data rows with alternating colors
            results.forEach((row, rowIndex) => {
                const excelRow = worksheet.addRow(headers.map(h => row[h] || ''));
                
                // Alternate row colors
                const bgColor = rowIndex % 2 === 0 ? 'FFF8F9FA' : 'FFFFFFFF';
                excelRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: bgColor }
                    };
                    cell.alignment = { wrapText: false, vertical: 'center' };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFC0C0C0' } },
                        left: { style: 'thin', color: { argb: 'FFC0C0C0' } },
                        bottom: { style: 'thin', color: { argb: 'FFC0C0C0' } },
                        right: { style: 'thin', color: { argb: 'FFC0C0C0' } }
                    };
                });
            });

            // Generate file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HealthFlow_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.addMessage('✅ Excel file downloaded successfully!', 'bot', false);
        } catch (error) {
            console.error('Excel export error:', error);
            this.addMessage(`❌ Error exporting to Excel: ${error.message}`, 'bot', false);
        }
    }

    /**
     * Export results to PDF
     */
    async exportToPDF() {
        try {
            this.addMessage('⏳ Preparing PDF file...', 'bot', false);
            
            const results = healthFlowChatbot.lastQueryResults || [];
            if (!results || results.length === 0) {
                this.addMessage('❌ No data to export', 'bot', false);
                return;
            }

            // Dynamically load jsPDF and autoTable libraries
            if (typeof window.jspdf === 'undefined') {
                await this.loadPDFLibraries();
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode

            // Add title and metadata
            doc.setFontSize(16);
            doc.setTextColor(21, 105, 107);
            doc.text('HealthFlow Data Export', 14, 15);
            
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
            doc.text(`Total Records: ${results.length}`, 14, 27);

            // Prepare table data with proper formatting
            const headers = Object.keys(results[0]);
            const rows = results.map(item => 
                headers.map(header => {
                    const value = item[header];
                    // Format dates
                    if (value instanceof Date) {
                        return value.toLocaleDateString();
                    }
                    // Format numbers
                    if (typeof value === 'number') {
                        return value.toLocaleString();
                    }
                    // Convert to string and truncate if too long
                    return String(value || '').substring(0, 100);
                })
            );

            // Add table with autoTable
            doc.autoTable({
                head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, ' '))],
                body: rows,
                startY: 35,
                margin: { top: 35, right: 10, bottom: 10, left: 10 },
                styles: {
                    fontSize: 9,
                    cellPadding: 4,
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'middle',
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                headStyles: {
                    fillColor: [21, 105, 107],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 8,
                    halign: 'center',
                    valign: 'middle',
                    overflow: 'ellipsis', // Truncate long header text
                    lineColor: [21, 105, 107],
                    lineWidth: 0.5
                },
                bodyStyles: {
                    overflow: 'linebreak', // Body text wraps normally
                    lineColor: [220, 220, 220],
                    lineWidth: 0.1
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252]
                },
                columnStyles: {
                    // Auto-adjust column widths based on content
                },
                willDrawCell: (data) => {
                    // Ensure header row has minimum height
                    if (data.section === 'head') {
                        data.cell.minHeight = 15;
                    }
                },
                didDrawPage: (data) => {
                    // Footer
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.getHeight();
                    const pageWidth = pageSize.getWidth();
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Page ${doc.internal.pages.length - 1}`,
                        pageWidth / 2,
                        pageHeight - 5,
                        { align: 'center' }
                    );
                }
            });

            // Save PDF
            doc.save(`HealthFlow_Export_${new Date().toISOString().split('T')[0]}.pdf`);
            this.addMessage('✅ PDF file downloaded successfully!', 'bot', false);
        } catch (error) {
            console.error('PDF export error:', error);
            this.addMessage(`❌ Error exporting to PDF: ${error.message}`, 'bot', false);
        }
    }

    /**
     * Load ExcelJS library dynamically
     */
    loadExcelJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load ExcelJS library'));
            document.head.appendChild(script);
        });
    }

    /**
     * Load jsPDF and autoTable libraries dynamically
     */
    loadPDFLibraries() {
        return new Promise((resolve, reject) => {
            // Load jsPDF first
            const jsPdfScript = document.createElement('script');
            jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPdfScript.onload = () => {
                // Load autoTable after jsPDF is ready
                const autoTableScript = document.createElement('script');
                autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
                autoTableScript.onload = () => {
                    // Wait a moment for plugin to attach, then resolve
                    setTimeout(() => resolve(), 100);
                };
                autoTableScript.onerror = () => reject(new Error('Failed to load autoTable library'));
                document.head.appendChild(autoTableScript);
            };
            jsPdfScript.onerror = () => reject(new Error('Failed to load jsPDF library'));
            document.head.appendChild(jsPdfScript);
        });
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
        this.overlay.classList.add('visible');
        this.fabBtn.classList.add('hidden');
        this.isOpen = true;
        setTimeout(() => this.inputField.focus(), 100);
    }

    /**
     * Close chatbot
     */
    close() {
        this.chatbotContainer.classList.add('hidden');
        this.overlay.classList.remove('visible');
        this.fabBtn.classList.remove('hidden');
        this.isOpen = false;
    }
}

// Initialize UI when DOM is ready
let chatbotUI;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for chatbot core to be available
    if (typeof healthFlowChatbot !== 'undefined') {
        chatbotUI = new ChatbotUI();
        window.chatbotUI = chatbotUI;  // Expose to global scope
        chatbotUI.init();
    } else {
        console.warn('HealthFlow Chatbot core not loaded');
    }
});