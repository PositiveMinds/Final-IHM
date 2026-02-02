/**
 * Chat System Module
 * Handles private and group chats with facility-based access control
 * Supports document sharing (PDF, PNG, JPEG, JPG only)
 */

// Only define if not already defined
if (typeof ChatSystem === "undefined") {
  class ChatSystem {
    constructor() {
      this.currentUser = null;
      this.currentChat = null;
      this.chats = [];
      this.messages = {};
      this.contacts = [];
      this.allowedFileTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];
      this.fileExtensions = [".pdf", ".png", ".jpeg", ".jpg"];
      this.init();
    }

    init() {
      this.loadCurrentUser();
      this.createChatPanel(); // Create DOM elements FIRST
      this.setupEventListeners();
      this.loadChats();
      this.loadContacts();
    }

    /**
     * Create chat panel DOM elements
     */
    createChatPanel() {
      // Check if panel already exists
      if (document.getElementById("chatPanelOverlay")) {
        return;
      }

      const panelHTML = `
      <div id="chatPanelOverlay" class="chat-panel-overlay"></div>
      <div id="chatContainer" class="chat-container">
        <button class="chat-panel-close" onclick="chatSystem.closeChat()" title="Close chat">
          <i class="ri-close-line"></i>
        </button>
        
        <div class="chat-sidebar">
          <div class="chat-sidebar-header">
            <h5 class="mb-3">Messages</h5>
            <div class="chat-actions">
              <button class="btn btn-sm btn-primary" id="newChatBtn" title="New Private Chat">
                <i class="ri-chat-new-line"></i> Chat
              </button>
              <button class="btn btn-sm btn-info" id="newGroupBtn" title="New Group Chat">
                <i class="ri-team-line"></i> Group
              </button>
            </div>
          </div>

          <div class="chat-search">
            <input 
              type="text" 
              id="chatSearchInput" 
              placeholder="Search contacts..."
              class="form-control form-control-sm"
            >
          </div>

          <div id="chatSearchResults" style="display: none; max-height: 300px; overflow-y: auto;">
          </div>

          <div id="chatList" class="chat-list">
          </div>
        </div>

        <div class="chat-main">
          <div id="chatViewHeader" class="chat-header">
            <div class="empty-chat-state">
              <i class="ri-chat-smile-line"></i>
              <p>Select a chat to start messaging</p>
            </div>
          </div>

          <div id="chatMessagesContainer" class="chat-messages">
            <div class="empty-chat-state">
              <i class="ri-chat-smile-line"></i>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>

          <div class="chat-input-area" id="chatInputArea" style="display: none;">
            <div class="chat-input-wrapper">
              <input 
                type="text" 
                id="chatMessageInput" 
                placeholder="Type a message..." 
                class="form-control"
              >
              <button type="button" class="btn btn-outline-secondary file-upload-btn" id="chatFileUploadBtn" title="Attach file">
                <i class="ri-attachment-2"></i>
              </button>
              <button type="button" class="btn btn-primary" id="chatSendBtn" title="Send message">
                <i class="ri-send-plane-line"></i>
              </button>
            </div>
            <input type="file" id="chatFileInput" accept=".pdf,.png,.jpeg,.jpg" multiple>
            <small class="text-muted d-block mt-2">
              <i class="ri-information-line"></i> Supported: PDF, PNG, JPEG, JPG (max 10MB)
            </small>
          </div>
        </div>
      </div>

      <!-- New Private Chat Modal -->
      <div class="modal fade" id="newChatModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="ri-chat-new-line me-2"></i>Start a New Chat
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input 
                  type="text" 
                  class="form-control" 
                  id="chatSearchModal" 
                  placeholder="Search for a contact..."
                >
              </div>
              <div id="chatContactsList">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Group Chat Modal -->
      <div class="modal fade" id="newGroupModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-info text-white">
              <h5 class="modal-title">
                <i class="ri-team-line me-2"></i>Create Group Chat
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="groupNameInput" class="form-label">Group Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="groupNameInput" 
                  placeholder="Enter group name..."
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Select Members</label>
                <div id="groupMembersList" class="border rounded" style="max-height: 300px; overflow-y: auto;">
                </div>
              </div>
              <button class="btn btn-info w-100" id="createGroupBtn" onclick="chatSystem.handleCreateGroup()">
                <i class="ri-check-line me-2"></i>Create Group
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

      // Insert panel into body
      document.body.insertAdjacentHTML("beforeend", panelHTML);

      // Re-setup event listeners now that panel is in DOM
      this.setupEventListeners();
    }

    /**
     * Open chat panel
     */
    openChat() {
      const overlay = document.getElementById("chatPanelOverlay");
      const container = document.getElementById("chatContainer");
      if (overlay && container) {
        overlay.classList.add("active");
        container.classList.add("open");
      }
    }

    /**
     * Close chat panel
     */
    closeChat() {
      const overlay = document.getElementById("chatPanelOverlay");
      const container = document.getElementById("chatContainer");
      if (overlay && container) {
        overlay.classList.remove("active");
        container.classList.remove("open");
      }
    }

    /**
     * Load current logged-in user
     */
    loadCurrentUser() {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }

    /**
     * Setup all event listeners for chat system
     */
    setupEventListeners() {
      // Send message
      const sendBtn = document.getElementById("chatSendBtn");
      const msgInput = document.getElementById("chatMessageInput");
      if (sendBtn) {
        sendBtn.addEventListener("click", () => this.sendMessage());
      }
      if (msgInput) {
        msgInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }

      // New chat button
      const newChatBtn = document.getElementById("newChatBtn");
      if (newChatBtn) {
        newChatBtn.addEventListener("click", () => this.showNewChatModal());
      }

      // New group button
      const newGroupBtn = document.getElementById("newGroupBtn");
      if (newGroupBtn) {
        newGroupBtn.addEventListener("click", () => this.showNewGroupModal());
      }

      // File upload
      const fileInput = document.getElementById("chatFileInput");
      if (fileInput) {
        fileInput.addEventListener("change", (e) => this.handleFileUpload(e));
      }

      // File upload button
      const fileUploadBtn = document.getElementById("chatFileUploadBtn");
      if (fileUploadBtn) {
        fileUploadBtn.addEventListener("click", () => {
          document.getElementById("chatFileInput").click();
        });
      }

      // Search contacts
      const searchInput = document.getElementById("chatSearchInput");
      if (searchInput) {
        searchInput.addEventListener("input", (e) =>
          this.filterContacts(e.target.value),
        );
      }

      // Overlay close
      this.setupOverlayClose();
    }

    /**
     * Load chats from localStorage or database
     */
    loadChats() {
      if (!this.currentUser) {
        console.log("No current user in loadChats");
        return;
      }

      console.log("Loading chats for user:", this.currentUser.id);
      const chatsStr = localStorage.getItem(`chats_${this.currentUser.id}`);
      console.log("Chats string from localStorage:", chatsStr);
      this.chats = chatsStr ? JSON.parse(chatsStr) : [];
      console.log("Parsed chats:", this.chats);

      // Load messages for each chat
      this.chats.forEach((chat) => {
        const messagesStr = localStorage.getItem(`messages_${chat.id}`);
        this.messages[chat.id] = messagesStr ? JSON.parse(messagesStr) : [];
      });

      console.log("Final chats and messages:", this.chats, this.messages);
      this.renderChatList();
    }

    /**
     * Load contacts based on user role and facility
     */
    loadContacts() {
      if (!this.currentUser) return;

      const allUsersStr = localStorage.getItem("allUsers");
      if (!allUsersStr) return;

      const allUsers = JSON.parse(allUsersStr);

      if (this.currentUser.role === "patient") {
        // Patients can only see health workers from their facility
        this.contacts = allUsers.filter(
          (user) =>
            user.facility_id === this.currentUser.facility_id &&
            user.role !== "patient" &&
            user.id !== this.currentUser.id,
        );
      } else if (this.currentUser.role === "health_worker") {
        // Health workers can see their patients and other health workers from same facility
        this.contacts = allUsers.filter(
          (user) =>
            user.facility_id === this.currentUser.facility_id &&
            user.id !== this.currentUser.id &&
            (user.role === "patient" || user.role === "health_worker"),
        );
      }
    }

    /**
     * Send a message
     */
    sendMessage() {
      if (!this.currentChat) {
        alert("Please select a chat first");
        return;
      }

      const msgInput = document.getElementById("chatMessageInput");
      const message = msgInput.value.trim();

      if (!message) return;

      const newMessage = {
        id: Date.now(),
        chatId: this.currentChat.id,
        senderId: this.currentUser.id,
        senderName: this.currentUser.full_name,
        content: message,
        timestamp: new Date().toISOString(),
        type: "text",
        attachments: [],
      };

      // Add to messages
      if (!this.messages[this.currentChat.id]) {
        this.messages[this.currentChat.id] = [];
      }
      this.messages[this.currentChat.id].push(newMessage);

      // Save to localStorage
      localStorage.setItem(
        `messages_${this.currentChat.id}`,
        JSON.stringify(this.messages[this.currentChat.id]),
      );

      // Update chat's last message
      const chat = this.chats.find((c) => c.id === this.currentChat.id);
      if (chat) {
        chat.lastMessage = message;
        chat.lastMessageTime = new Date().toISOString();
        chat.lastMessageSender = this.currentUser.id;
        this.saveChats();
      }

      msgInput.value = "";
      this.renderMessages();
      this.renderChatList();
    }

    /**
     * Handle file upload for chat
     */
    handleFileUpload(event) {
      const files = event.target.files;

      for (let file of files) {
        // Validate file type
        const isValidType =
          this.allowedFileTypes.includes(file.type) ||
          this.fileExtensions.some((ext) =>
            file.name.toLowerCase().endsWith(ext),
          );

        if (!isValidType) {
          alert(
            `File type not allowed. Only PDF, PNG, JPEG, and JPG files are supported.`,
          );
          continue;
        }

        // Validate file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Read file and create message
        const reader = new FileReader();
        reader.onload = (e) => {
          this.createFileMessage(file, e.target.result);
        };
        reader.readAsDataURL(file);
      }

      // Clear input
      event.target.value = "";
    }

    /**
     * Create a file message
     */
    createFileMessage(file, dataUrl) {
      if (!this.currentChat) {
        alert("Please select a chat first");
        return;
      }

      const newMessage = {
        id: Date.now(),
        chatId: this.currentChat.id,
        senderId: this.currentUser.id,
        senderName: this.currentUser.full_name,
        content: "",
        timestamp: new Date().toISOString(),
        type: "file",
        attachments: [
          {
            id: Date.now(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: dataUrl,
          },
        ],
      };

      if (!this.messages[this.currentChat.id]) {
        this.messages[this.currentChat.id] = [];
      }
      this.messages[this.currentChat.id].push(newMessage);

      localStorage.setItem(
        `messages_${this.currentChat.id}`,
        JSON.stringify(this.messages[this.currentChat.id]),
      );

      this.renderMessages();
    }

    /**
     * Show new chat modal
     */
    showNewChatModal() {
      const modal = new bootstrap.Modal(
        document.getElementById("newChatModal"),
      );
      this.renderContactsList("chatContactsList");
      modal.show();
    }

    /**
     * Show new group modal
     */
    showNewGroupModal() {
      const modal = new bootstrap.Modal(
        document.getElementById("newGroupModal"),
      );
      this.renderContactsList("groupMembersList");
      modal.show();
    }

    /**
     * Render contacts list for selection
     */
    renderContactsList(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (this.contacts.length === 0) {
        container.innerHTML =
          '<p class="text-muted text-center py-4">No contacts available</p>';
        return;
      }

      const contactsHtml = this.contacts
        .map(
          (contact) => `
      <div class="contact-item p-3 border-bottom d-flex align-items-center">
        <input type="checkbox" class="form-check-input me-3" value="${contact.id}" data-contact-id="${contact.id}">
        <div class="flex-grow-1">
          <div class="fw-500">${contact.full_name}</div>
          <small class="text-muted">${contact.role === "patient" ? "Patient" : "Health Worker"}</small>
        </div>
      </div>
    `,
        )
        .join("");

      container.innerHTML = contactsHtml;
    }

    /**
     * Create a new private chat
     */
    createPrivateChat(contactId) {
      const contact = this.contacts.find((c) => c.id === contactId);
      if (!contact) return;

      // Check if chat already exists
      const existingChat = this.chats.find(
        (chat) =>
          chat.type === "private" && chat.participants.includes(contactId),
      );

      if (existingChat) {
        this.selectChat(existingChat.id);
        return;
      }

      const newChat = {
        id: Date.now().toString(),
        type: "private",
        name: contact.full_name,
        participants: [this.currentUser.id, contactId],
        createdAt: new Date().toISOString(),
        createdBy: this.currentUser.id,
        lastMessage: "",
        lastMessageTime: null,
        lastMessageSender: null,
        avatar: contact.avatar || this.getInitials(contact.full_name),
      };

      this.chats.push(newChat);
      this.messages[newChat.id] = [];
      this.saveChats();
      this.selectChat(newChat.id);
    }

    /**
     * Create a new group chat
     */
    createGroupChat(groupName, memberIds) {
      if (!groupName.trim()) {
        alert("Please enter a group name");
        return;
      }

      if (memberIds.length === 0) {
        alert("Please select at least one member");
        return;
      }

      // Ensure current user is included
      if (!memberIds.includes(this.currentUser.id)) {
        memberIds.push(this.currentUser.id);
      }

      const newChat = {
        id: Date.now().toString(),
        type: "group",
        name: groupName,
        participants: memberIds,
        createdAt: new Date().toISOString(),
        createdBy: this.currentUser.id,
        lastMessage: "",
        lastMessageTime: null,
        lastMessageSender: null,
        avatar: this.getInitials(groupName),
      };

      this.chats.push(newChat);
      this.messages[newChat.id] = [];
      this.saveChats();
      this.selectChat(newChat.id);
    }

    /**
     * Select a chat to view
     */
    selectChat(chatId) {
      const chat = this.chats.find((c) => c.id === chatId);
      if (!chat) return;

      this.currentChat = chat;
      this.renderChatView();
      this.renderMessages();

      // Show input area
      const inputArea = document.getElementById("chatInputArea");
      if (inputArea) {
        inputArea.style.display = "block";
      }

      // Update active state in chat list
      document.querySelectorAll(".chat-item").forEach((item) => {
        item.classList.remove("active");
      });
      const activeItem = document.querySelector(
        `[onclick*="selectChat('${chatId}')"]`,
      );
      if (activeItem) {
        activeItem.classList.add("active");
      }
    }

    /**
     * Render chat list
     */
    renderChatList() {
      const container = document.getElementById("chatList");
      console.log("renderChatList - container found:", !!container);
      if (!container) {
        console.log("No chatList container found in DOM");
        return;
      }

      if (this.chats.length === 0) {
        container.innerHTML =
          '<p class="text-muted text-center py-4">No chats yet. Start a conversation.</p>';
        return;
      }

      // Sort by last message time
      const sortedChats = [...this.chats].sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.createdAt);
        const timeB = new Date(b.lastMessageTime || b.createdAt);
        return timeB - timeA;
      });

      const chatsHtml = sortedChats
        .map((chat) => {
          const isSelected =
            this.currentChat && this.currentChat.id === chat.id ? "active" : "";
          const timeStr = this.formatTime(
            chat.lastMessageTime || chat.createdAt,
          );

          return `
        <div class="chat-item ${isSelected} p-3 border-bottom cursor-pointer" onclick="chatSystem.selectChat('${chat.id}')">
          <div class="d-flex align-items-center">
            <div class="chat-avatar me-3" style="width: 45px; height: 45px; border-radius: 50%; background: #15696B; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
              ${chat.avatar}
            </div>
            <div class="flex-grow-1">
              <div class="fw-500 text-truncate">${chat.name}</div>
              <small class="text-muted text-truncate">${chat.lastMessage || "No messages yet"}</small>
            </div>
            <small class="text-muted ms-2">${timeStr}</small>
          </div>
        </div>
      `;
        })
        .join("");

      container.innerHTML = chatsHtml;
    }

    /**
     * Render chat view header
     */
    renderChatView() {
      const header = document.getElementById("chatViewHeader");
      if (!header || !this.currentChat) return;

      const participantCount =
        this.currentChat.type === "group"
          ? `${this.currentChat.participants.length} members`
          : "1 contact";

      header.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="chat-avatar me-3" style="width: 40px; height: 40px; border-radius: 50%; background: #15696B; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
            ${this.currentChat.avatar}
          </div>
          <div>
            <div class="fw-500">${this.currentChat.name}</div>
            <small class="text-muted">${participantCount}</small>
          </div>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary" onclick="chatSystem.showChatInfo()">
            <i class="ri-information-line"></i> Info
          </button>
        </div>
      </div>
    `;
    }

    /**
     * Render messages
     */
    renderMessages() {
      const container = document.getElementById("chatMessagesContainer");
      if (!container || !this.currentChat) return;

      const messages = this.messages[this.currentChat.id] || [];

      if (messages.length === 0) {
        container.innerHTML =
          '<div class="text-center text-muted py-5">No messages yet. Start the conversation.</div>';
        return;
      }

      const messagesHtml = messages
        .map((msg) => {
          const isOwn = msg.senderId === this.currentUser.id;
          const timeStr = this.formatTime(msg.timestamp);
          const senderInitials = this.getInitials(msg.senderName);

          let contentHtml = "";
          if (msg.type === "text") {
            contentHtml = `<div class="message-text">${this.escapeHtml(msg.content)}</div>`;
          } else if (msg.type === "file") {
            contentHtml = msg.attachments
              .map(
                (att) => `
          <div class="message-file">
            <div class="d-flex align-items-center">
              <i class="ri-file-line me-2"></i>
              <a href="${att.url}" download="${att.name}" class="text-decoration-none flex-grow-1">
                ${att.name} (${this.formatFileSize(att.size)})
              </a>
            </div>
          </div>
        `,
              )
              .join("");
          }

          const senderNameHtml =
            !isOwn && this.currentChat.type === "group"
              ? `<span class="message-sender-name">${msg.senderName}</span>`
              : "";

          return `
        <div class="message-group ${isOwn ? "text-end" : ""}">
          ${!isOwn ? `<div class="message-avatar">${senderInitials}</div>` : ""}
          <div class="message-wrapper">
            ${senderNameHtml}
            <div class="message-item">
              ${contentHtml}
              <small class="message-time">${timeStr}</small>
            </div>
          </div>
        </div>
      `;
        })
        .join("");

      container.innerHTML = messagesHtml;
      container.scrollTop = container.scrollHeight;
    }

    /**
     * Show chat info
     */
    showChatInfo() {
      if (!this.currentChat) return;

      const participantsHtml = this.currentChat.participants
        .map((pid) => {
          const allUsersStr = localStorage.getItem("allUsers");
          const allUsers = allUsersStr ? JSON.parse(allUsersStr) : [];
          const user = allUsers.find((u) => u.id === pid);
          return user
            ? `<li>${user.full_name} (${user.role === "patient" ? "Patient" : "Health Worker"})</li>`
            : "";
        })
        .join("");

      alert(
        `Chat: ${this.currentChat.name}\nType: ${this.currentChat.type === "group" ? "Group" : "Private"}\nMembers:\n${participantsHtml}`,
      );
    }

    /**
     * Filter contacts by search
     */
    filterContacts(query) {
      const filtered = this.contacts.filter((contact) =>
        contact.full_name.toLowerCase().includes(query.toLowerCase()),
      );

      const container = document.getElementById("chatSearchResults");
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML =
          '<p class="text-muted text-center py-4">No contacts found</p>';
        return;
      }

      container.innerHTML = filtered
        .map(
          (contact) => `
      <div class="contact-item p-3 border-bottom d-flex align-items-center">
        <div class="flex-grow-1">
          <div class="fw-500">${contact.full_name}</div>
          <small class="text-muted">${contact.role === "patient" ? "Patient" : "Health Worker"}</small>
        </div>
        <button class="btn btn-sm btn-primary" onclick="chatSystem.createPrivateChat('${contact.id}')">
          Chat
        </button>
      </div>
    `,
        )
        .join("");
    }

    /**
     * Save chats to localStorage
     */
    saveChats() {
      if (!this.currentUser) return;
      localStorage.setItem(
        `chats_${this.currentUser.id}`,
        JSON.stringify(this.chats),
      );
    }

    /**
     * Utility: Format time
     */
    formatTime(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }

    /**
     * Utility: Format file size
     */
    formatFileSize(bytes) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    }

    /**
     * Utility: Get initials
     */
    getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    /**
     * Handle create group
     */
    handleCreateGroup() {
      const groupName = document.getElementById("groupNameInput").value;
      const checkboxes = document.querySelectorAll(
        '#groupMembersList input[type="checkbox"]:checked',
      );
      const memberIds = Array.from(checkboxes).map((cb) =>
        cb.getAttribute("data-contact-id"),
      );

      this.createGroupChat(groupName, memberIds);

      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("newGroupModal"),
      );
      if (modal) {
        modal.hide();
      }

      // Reset form
      document.getElementById("groupNameInput").value = "";
      checkboxes.forEach((cb) => (cb.checked = false));

      // Show input area
      document.getElementById("chatInputArea").style.display = "block";
    }

    /**
     * Handle overlay click to close
     */
    setupOverlayClose() {
      const overlay = document.getElementById("chatPanelOverlay");
      if (overlay) {
        overlay.addEventListener("click", () => this.closeChat());
      }
    }
  }

  // Initialize chat system when DOM is ready
  if (typeof chatSystem === "undefined" || !chatSystem) {
    let chatSystem;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        if (!window.chatSystem) {
          window.chatSystem = new ChatSystem();
        }
      });
    } else {
      if (!window.chatSystem) {
        window.chatSystem = new ChatSystem();
      }
    }
  }
}
// Make chatSystem available globally if it was created
if (
  typeof window.chatSystem === "undefined" &&
  typeof ChatSystem !== "undefined"
) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.chatSystem = new ChatSystem();
    });
  } else {
    window.chatSystem = new ChatSystem();
  }
}
