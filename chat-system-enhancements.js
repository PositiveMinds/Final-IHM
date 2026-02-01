/**
 * Chat System Enhancements
 * Extends the existing chat system with improved features and UX
 */

// Wait for ChatSystem to be available
function initializeChatEnhancements() {
  if (typeof ChatSystem === 'undefined' || !window.chatSystem) {
    setTimeout(initializeChatEnhancements, 100);
    return;
  }

  console.log('[Chat Enhancements] Initializing...');

  // Enhance the ChatSystem prototype
  const originalRenderMessages = ChatSystem.prototype.renderMessages;
  
  /**
   * Enhanced message rendering with better UI
   */
  ChatSystem.prototype.renderMessages = function() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!this.currentChat || !this.messages[this.currentChat]) {
      container.innerHTML = `
        <div class="empty-chat-state">
          <i class="ri-chat-smile-line"></i>
          <p>No messages yet. Start the conversation!</p>
        </div>
      `;
      return;
    }

    const messages = this.messages[this.currentChat];
    let lastSenderId = null;
    let messageGroup = null;

    messages.forEach((msg, index) => {
      const isCurrentUser = msg.senderId === this.currentUser.id;
      const isSameSender = lastSenderId === msg.senderId;

      // Create message group if sender changed or first message
      if (!isSameSender) {
        messageGroup = document.createElement('div');
        messageGroup.className = `message-group ${isCurrentUser ? 'text-end' : ''}`;
        container.appendChild(messageGroup);
        lastSenderId = msg.senderId;
      }

      // Create message element
      const messageEl = document.createElement('div');
      messageEl.className = 'message-item';
      
      // Format time
      const msgTime = new Date(msg.timestamp);
      const timeStr = msgTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      let messageHTML = `<div class="message-text">${this.escapeHtml(msg.content)}</div>`;
      
      // Add time
      messageHTML += `<div class="message-time">${timeStr}</div>`;

      // Add file if present
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(file => {
          const fileIcon = this.getFileIcon(file.name);
          messageHTML += `
            <div class="message-file">
              <a href="${file.data}" download="${file.name}">
                <i class="ri-${fileIcon}-line"></i>
                <span>${file.name}</span>
              </a>
            </div>
          `;
        });
      }

      messageEl.innerHTML = messageHTML;
      messageGroup.appendChild(messageEl);
    });

    // Scroll to bottom
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  };

  /**
   * Enhance chat list rendering with status indicators
   */
  const originalRenderChats = ChatSystem.prototype.renderChats;
  ChatSystem.prototype.renderChats = function() {
    const chatList = document.getElementById('chatList');
    if (!chatList) return;

    chatList.innerHTML = '';

    if (this.chats.length === 0) {
      chatList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #9ca3af;">
          <i class="ri-inbox-line" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
          <p style="margin: 0;">No conversations yet</p>
          <small style="color: #d1d5db;">Start a new chat to begin</small>
        </div>
      `;
      return;
    }

    this.chats.forEach(chat => {
      const isActive = this.currentChat === chat.id;
      const lastMsg = this.messages[chat.id]?.length > 0 
        ? this.messages[chat.id][this.messages[chat.id].length - 1] 
        : null;
      
      const lastMsgText = lastMsg ? lastMsg.content.substring(0, 40) : 'No messages';
      const lastMsgTime = lastMsg 
        ? new Date(lastMsg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '';

      const item = document.createElement('button');
      item.className = `chat-item ${isActive ? 'active' : ''}`;
      item.type = 'button';
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div style="flex: 1; text-align: left;">
            <div class="fw-500">${chat.name}</div>
            <div class="text-muted">${lastMsgText}${lastMsgText.length > 40 ? '...' : ''}</div>
          </div>
          <small class="text-muted" style="white-space: nowrap; margin-left: 8px;">${lastMsgTime}</small>
        </div>
      `;
      
      item.addEventListener('click', () => this.selectChat(chat.id));
      chatList.appendChild(item);
    });
  };

  /**
   * Add typing indicator feature
   */
  ChatSystem.prototype.showTypingIndicator = function(senderName) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    // Remove existing typing indicator
    const existingIndicator = container.querySelector('.typing-indicator');
    if (existingIndicator) existingIndicator.remove();

    // Create typing indicator
    const indicator = document.createElement('div');
    indicator.className = 'message-group typing-indicator';
    indicator.innerHTML = `
      <div class="message-item" style="background: #e5e7eb; border: none;">
        <div style="display: flex; gap: 4px; align-items: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.4s;"></div>
        </div>
      </div>
    `;

    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  };

  /**
   * Remove typing indicator
   */
  ChatSystem.prototype.removeTypingIndicator = function() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  };

  /**
   * Add message read status (visual enhancement)
   */
  ChatSystem.prototype.markMessagesAsRead = function() {
    const messages = document.querySelectorAll('.message-item');
    messages.forEach(msg => {
      msg.style.opacity = '1';
    });
  };

  /**
   * Enhanced input area with character count and emoji support
   */
  ChatSystem.prototype.enhanceInputArea = function() {
    const inputArea = document.getElementById('chatInputArea');
    if (!inputArea) return;

    const input = document.getElementById('chatMessageInput');
    if (!input) return;

    // Add character counter
    if (!document.getElementById('charCount')) {
      const charCount = document.createElement('div');
      charCount.id = 'charCount';
      charCount.style.cssText = `
        font-size: 0.75rem;
        color: #9ca3af;
        margin-top: 4px;
        text-align: right;
      `;
      input.parentElement.appendChild(charCount);

      input.addEventListener('input', () => {
        const count = input.value.length;
        charCount.textContent = `${count}/500`;
        
        if (count > 450) {
          charCount.style.color = '#f59e0b';
        } else if (count > 490) {
          charCount.style.color = '#ef4444';
        } else {
          charCount.style.color = '#9ca3af';
        }
      });
    }

    // Auto-expand textarea
    input.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    });
  };

  /**
   * Add search/filter functionality
   */
  ChatSystem.prototype.setupSearchEnhancements = function() {
    const searchInput = document.getElementById('chatSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const searchResults = document.getElementById('chatSearchResults');
      
      if (!query) {
        searchResults.style.display = 'none';
        document.getElementById('chatList').style.display = 'block';
        return;
      }

      // Filter chats
      const filtered = this.chats.filter(chat => 
        chat.name.toLowerCase().includes(query)
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = `
          <div style="padding: 20px; text-align: center; color: #9ca3af;">
            <p style="margin: 0;">No matches found</p>
          </div>
        `;
      } else {
        searchResults.innerHTML = '';
        filtered.forEach(chat => {
          const btn = document.createElement('button');
          btn.className = 'chat-item';
          btn.type = 'button';
          btn.textContent = chat.name;
          btn.addEventListener('click', () => {
            this.selectChat(chat.id);
            searchInput.value = '';
            searchResults.style.display = 'none';
            document.getElementById('chatList').style.display = 'block';
          });
          searchResults.appendChild(btn);
        });
      }

      document.getElementById('chatList').style.display = 'none';
      searchResults.style.display = 'block';
    });
  };

  /**
   * Get appropriate file icon based on file type
   */
  ChatSystem.prototype.getFileIcon = function(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      'pdf': 'file-pdf',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'zip': 'file-zip',
      'txt': 'file-text'
    };
    return iconMap[ext] || 'file';
  };

  /**
   * HTML escape to prevent XSS
   */
  ChatSystem.prototype.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  /**
   * Copy message to clipboard
   */
  ChatSystem.prototype.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show toast notification
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #15696B;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      toast.textContent = '✓ Copied to clipboard';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    });
  };

  /**
   * Add keyboard shortcuts
   */
  ChatSystem.prototype.setupKeyboardShortcuts = function() {
    document.addEventListener('keydown', (e) => {
      const input = document.getElementById('chatMessageInput');
      if (!input) return;

      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && input.value.trim()) {
        this.sendMessage();
      }

      // Escape to close chat
      if (e.key === 'Escape' && document.getElementById('chatPanelOverlay').classList.contains('active')) {
        this.closeChat();
      }
    });
  };

  /**
   * Initialize all enhancements
   */
  function initializeAllEnhancements() {
    try {
      window.chatSystem.enhanceInputArea();
      window.chatSystem.setupSearchEnhancements();
      window.chatSystem.setupKeyboardShortcuts();
      window.chatSystem.renderMessages();
      window.chatSystem.renderChats();
      
      console.log('[Chat Enhancements] Initialized successfully');
    } catch (error) {
      console.error('[Chat Enhancements] Error during initialization:', error);
    }
  }

  // Run enhancements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEnhancements);
  } else {
    initializeAllEnhancements();
  }
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatEnhancements);
} else {
  initializeChatEnhancements();
}

// Add typing animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-8px);
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('[Chat System Enhancements] Module loaded');
