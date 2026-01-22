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
    this.initialSuggestions = [
      "Show me all HIV positive patients",
      "List active patients with diabetes",
      "How many critical patients do we have?",
      "Show patients with viral load detectable",
      "List patients age 50 and above",
      "Find female patients"
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
    fabBtn.innerHTML = '<i class="fas fa-comments"></i>';
    fabBtn.id = 'chatbot-fab';
    fabBtn.title = 'Open AI Assistant';
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
    `;

    this.addMessage(welcomeHTML, 'bot');
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
      // Process message with chatbot
      const response = await healthFlowChatbot.processMessage(userMessage);
      
      // Remove loading
      this.removeLoading();

      // Add bot response
      this.addMessage(response, 'bot', true);
    } catch (error) {
      this.removeLoading();
      this.addMessage(`Error: ${error.message}`, 'bot', false);
    }

    // Focus input
    this.inputField.focus();
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
