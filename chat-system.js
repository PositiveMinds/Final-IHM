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
            this.typingUsers = new Set();
            this.typingTimeout = null;
            this.searchQuery = "";
            this.pinnedMessages = {};
            this.messageReactions = {};
            this.readReceipts = {};
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

          <div class="chat-message-search" id="chatMessageSearch" style="display: none;">
            <input 
              type="text" 
              id="messageSearchInput" 
              placeholder="Search messages..." 
              class="form-control form-control-sm"
            >
            <button class="btn btn-sm btn-outline-secondary" id="messageSearchCloseBtn" title="Close search">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div id="chatMessagesContainer" class="chat-messages">
             <div class="empty-chat-state">
               <i class="ri-chat-smile-line"></i>
               <p>No messages yet. Start the conversation!</p>
             </div>
           </div>

           <div id="typingIndicator" class="typing-indicator" style="display: none;">
             <span></span><span></span><span></span>
             <small id="typingText" class="typing-text"></small>
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
               <button type="button" class="btn btn-outline-secondary search-messages-btn" id="searchMessagesBtn" title="Search messages">
                 <i class="ri-search-line"></i>
               </button>
               <button type="button" class="btn btn-primary" id="chatSendBtn" title="Send message">
                 <i class="ri-send-plane-line"></i>
               </button>
             </div>
             <input type="file" id="chatFileInput" accept=".pdf,.png,.jpeg,.jpg" multiple>
             <small class="text-muted d-block mt-2">
               <i class="ri-information-line"></i> Supported: PDF, PNG, JPEG, JPG (max 10MB). Images auto-compressed to 200KB.
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

            // Search messages button
            const searchMessagesBtn = document.getElementById("searchMessagesBtn");
            if (searchMessagesBtn) {
                searchMessagesBtn.addEventListener("click", () =>
                    this.toggleMessageSearch(),
                );
            }

            // Message search
            const messageSearchInput = document.getElementById("messageSearchInput");
            if (messageSearchInput) {
                messageSearchInput.addEventListener("keyup", (e) =>
                    this.searchMessages(e.target.value),
                );
            }

            // Close message search
            const messageSearchCloseBtn = document.getElementById(
                "messageSearchCloseBtn",
            );
            if (messageSearchCloseBtn) {
                messageSearchCloseBtn.addEventListener("click", () =>
                    this.toggleMessageSearch(),
                );
            }

            // Typing indicator
            if (msgInput) {
                msgInput.addEventListener("input", () =>
                    this.broadcastTypingIndicator(),
                );
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

            const messageInput = document.getElementById("chatMessageInput");
            const message = messageInput.value.trim();

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
            console.log(`[Chat] Files selected: ${files.length}`);

            // Separate images and non-images
            const imagesToPreview = [];
            const filesToUpload = [];
            let validFilesCount = 0;

            for (let file of files) {
                console.log(`[Chat] Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
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

                validFilesCount++;

                // Check if it's an image - collect for preview
                if (file.type.startsWith('image/')) {
                    console.log(`[Chat] Image detected, collecting for preview...`);
                    imagesToPreview.push(file);
                } else {
                    // For PDFs and other files, collect for direct upload
                    filesToUpload.push(file);
                }
            }

            // Process non-image files immediately
            filesToUpload.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log(`[Chat] File read complete for ${file.name}, dataUrl length: ${e.target.result.length}`);
                    this.pendingAttachments = this.pendingAttachments || [];
                    this.pendingAttachments.push({
                        file: file,
                        dataUrl: e.target.result
                    });
                };
                reader.onerror = (e) => {
                    console.error(`[Chat] Error reading file ${file.name}:`, e);
                    alert(`Error reading file ${file.name}`);
                };
                reader.readAsDataURL(file);
            });

            // Show preview modal for images if any
            if (imagesToPreview.length > 0) {
                console.log(`[Chat] Showing preview modal for ${imagesToPreview.length} image(s)`);
                this.showImagePreviewModal(imagesToPreview);
            } else if (filesToUpload.length > 0 && imagesToPreview.length === 0) {
                // If only non-image files were selected, send them after a short delay to ensure FileReader completes
                setTimeout(() => {
                    this.createFileMessage();
                }, 100);
            }

            // Clear input
            event.target.value = "";
        }

        /**
         * Open file upload dialog again to add more images
         */
        addMoreImages() {
            const fileInput = document.getElementById("chatFileInput");
            if (fileInput) {
                fileInput.click();
            }
        }

        /**
         * Compress image to max 200KB using canvas
         */
        compressImage(file, callback) {
            const MAX_SIZE = 200 * 1024; // 200KB
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`[Chat] Original image: ${img.width}x${img.height}, size: ${file.size} bytes`);

                    let quality = 0.8;
                    let compressedDataUrl = null;
                    let attempts = 0;
                    const maxAttempts = 5;

                    const compressAttempt = () => {
                        attempts++;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Maintain aspect ratio, max 1200x1200
                        const maxDimension = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > maxDimension || height > maxDimension) {
                            const ratio = Math.min(maxDimension / width, maxDimension / height);
                            width = Math.round(width * ratio);
                            height = Math.round(height * ratio);
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to data URL with reduced quality
                        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        const compressedSize = compressedDataUrl.length;

                        console.log(`[Chat] Compression attempt ${attempts}: quality=${quality.toFixed(2)}, size=${compressedSize} bytes, dims=${width}x${height}`);

                        // If size is acceptable or we've tried enough, use it
                        if (compressedSize <= MAX_SIZE || attempts >= maxAttempts) {
                            console.log(`[Chat] Final compressed size: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)}KB)`);
                            callback(compressedDataUrl);
                        } else {
                            // Reduce quality and try again
                            quality -= 0.1;
                            compressAttempt();
                        }
                    };

                    compressAttempt();
                };

                img.onerror = () => {
                    console.error(`[Chat] Failed to load image for compression`);
                    // Fallback: send original
                    callback(e.target.result);
                };

                img.src = e.target.result;
            };

            reader.onerror = (e) => {
                console.error(`[Chat] Error reading file for compression:`, e);
                alert(`Error reading file ${file.name}`);
            };

            reader.readAsDataURL(file);
        }

        /**
         * Show image preview modal (WhatsApp style) - supports multiple images
         */
        showImagePreviewModal(files) {
            // Handle both single file and array of files
            if (!Array.isArray(files)) {
                files = [files];
            }

            console.log(`[Chat] Preparing preview modal for ${files.length} image(s)`);
            
            // Initialize or merge with existing pending images
            if (!this.pendingImageFiles) {
                this.pendingImageFiles = [];
                this.pendingImageDataUrls = [];
            }
            
            const startIndex = this.pendingImageFiles.length;
            this.pendingImageFiles = this.pendingImageFiles.concat(files);
            
            let imagesLoadedCount = 0;

            // Load all images
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target.result;
                    const globalIndex = startIndex + index;
                    console.log(`[Chat] Image ${globalIndex + 1} loaded for preview, size: ${imageDataUrl.length}`);
                    this.pendingImageDataUrls[globalIndex] = imageDataUrl;
                    imagesLoadedCount++;
                    
                    // When all images are loaded, show the modal
                    if (imagesLoadedCount === files.length) {
                        this.displayImagePreviewModal(this.pendingImageFiles);
                    }
                };
                reader.onerror = (e) => {
                    console.error(`[Chat] Error reading file for preview:`, e);
                    alert(`Error reading file ${file.name}`);
                };
                console.log(`[Chat] Reading file for preview: ${file.name}`);
                reader.readAsDataURL(file);
            });
        }

        /**
         * Display the image preview modal with thumbnail carousel and multi-select
         */
        displayImagePreviewModal(files) {
            // Create modal if it doesn't exist
            let modal = document.getElementById("imagePreviewModal");
            if (!modal) {
                console.log(`[Chat] Creating image preview modal`);
                const modalHtml = `
                    <div class="modal fade" id="imagePreviewModal" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modal-lg">
                            <div class="modal-content bg-dark">
                                <div class="modal-body p-0 position-relative">
                                    <img id="previewModalImage" src="" alt="Preview" style="width: 100%; height: auto; max-height: 70vh; object-fit: contain; border-radius: 8px;">
                                    <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal"></button>
                                    
                                    <!-- Image counter and navigation -->
                                    <div id="imageCarouselControls" style="position: absolute; bottom: 75px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; align-items: center;">
                                        <button type="button" class="btn btn-sm btn-light" id="prevImageBtn" style="display: none;">
                                            <i class="ri-arrow-left-s-line"></i>
                                        </button>
                                        <span id="imageCounter" class="text-light" style="min-width: 60px; text-align: center; font-size: 12px;"></span>
                                        <button type="button" class="btn btn-sm btn-light" id="nextImageBtn" style="display: none;">
                                            <i class="ri-arrow-right-s-line"></i>
                                        </button>
                                    </div>
                                    
                                    <!-- Image thumbnails for multi-select -->
                                    <div id="imageThumbnails" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: rgba(0, 0, 0, 0.7); padding: 10px; border-radius: 8px; max-width: 85%; overflow-x: auto;">
                                    </div>
                                </div>
                                <div class="modal-footer border-0 gap-2">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                    <button type="button" class="btn btn-outline-light" id="addMoreImagesBtn" onclick="chatSystem.addMoreImages()">
                                        <i class="ri-add-line me-2"></i>Add More
                                    </button>
                                    <button type="button" class="btn btn-primary" id="sendImagesBtn">
                                        <i class="ri-send-plane-fill me-2"></i>Send <span id="sendImageCount" style="margin-left: 4px;"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML("beforeend", modalHtml);
                modal = document.getElementById("imagePreviewModal");
                console.log(`[Chat] Modal created:`, modal);
            }
            
            // Initialize selection state (all new images selected by default, preserve existing selections)
            if (!this.selectedImageIndices) {
                this.selectedImageIndices = new Set();
            }
            const newImagesStartIndex = files.length - (this.pendingImageFiles.length - files.length);
            files.forEach((_, idx) => {
                this.selectedImageIndices.add(idx);
            });
            this.currentImageIndex = 0;
            
            // Set initial preview image
            const previewImg = document.getElementById("previewModalImage");
            if (previewImg) {
                previewImg.src = this.pendingImageDataUrls[0];
                console.log(`[Chat] Preview image source set to image 1`);
            }
            
            // Update counter
            const imageCounter = document.getElementById("imageCounter");
            if (imageCounter && files.length > 1) {
                imageCounter.textContent = `1 / ${files.length}`;
            }
            
            // Create and setup thumbnails
            const thumbnailsContainer = document.getElementById("imageThumbnails");
            if (thumbnailsContainer && files.length > 1) {
                thumbnailsContainer.innerHTML = "";
                files.forEach((file, index) => {
                    const thumbnail = document.createElement("div");
                    thumbnail.style.position = "relative";
                    thumbnail.style.cursor = "pointer";
                    thumbnail.style.borderRadius = "4px";
                    thumbnail.style.overflow = "hidden";
                    thumbnail.style.border = "2px solid transparent";
                    thumbnail.style.transition = "all 0.2s ease";
                    thumbnail.dataset.imageIndex = index;
                    
                    const img = document.createElement("img");
                    img.src = this.pendingImageDataUrls[index];
                    img.style.width = "50px";
                    img.style.height = "50px";
                    img.style.objectFit = "cover";
                    
                    // Selection checkmark overlay
                    const checkmark = document.createElement("div");
                    checkmark.style.position = "absolute";
                    checkmark.style.top = "0";
                    checkmark.style.left = "0";
                    checkmark.style.width = "100%";
                    checkmark.style.height = "100%";
                    checkmark.style.background = "rgba(52, 168, 224, 0.3)";
                    checkmark.style.display = "flex";
                    checkmark.style.alignItems = "center";
                    checkmark.style.justifyContent = "center";
                    checkmark.style.color = "white";
                    checkmark.style.fontSize = "20px";
                    checkmark.innerHTML = "✓";
                    checkmark.style.opacity = "0";
                    checkmark.style.transition = "opacity 0.2s ease";
                    
                    thumbnail.appendChild(img);
                    thumbnail.appendChild(checkmark);
                    
                    // Click to select/deselect
                    thumbnail.addEventListener("click", () => {
                        if (this.selectedImageIndices.has(index)) {
                            this.selectedImageIndices.delete(index);
                        } else {
                            this.selectedImageIndices.add(index);
                        }
                        
                        this.updateImagePreview(files);
                        this.updateThumbnailSelection();
                        this.updateSendButtonText(files);
                    });
                    
                    // Update preview on hover
                    thumbnail.addEventListener("mouseenter", () => {
                        this.currentImageIndex = index;
                        this.updateImagePreview(files);
                    });
                    
                    thumbnailsContainer.appendChild(thumbnail);
                });
                
                this.updateThumbnailSelection();
            }
            
            // Update send button count
            const sendImageCount = document.getElementById("sendImageCount");
            this.updateSendButtonText(files);
            
            // Setup navigation if multiple images
            if (files.length > 1) {
                document.getElementById("prevImageBtn").style.display = "block";
                document.getElementById("nextImageBtn").style.display = "block";
                
                // Remove old listeners by cloning
                const prevBtn = document.getElementById("prevImageBtn");
                const nextBtn = document.getElementById("nextImageBtn");
                const newPrevBtn = prevBtn.cloneNode(true);
                const newNextBtn = nextBtn.cloneNode(true);
                prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
                nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
                
                // Add new listeners
                newPrevBtn.addEventListener("click", () => {
                    this.currentImageIndex = (this.currentImageIndex - 1 + files.length) % files.length;
                    this.updateImagePreview(files);
                });
                newNextBtn.addEventListener("click", () => {
                    this.currentImageIndex = (this.currentImageIndex + 1) % files.length;
                    this.updateImagePreview(files);
                });
            }
            
            // Setup send button
            const sendBtn = document.getElementById("sendImagesBtn");
            if (sendBtn) {
                // Remove old listeners by cloning
                const newSendBtn = sendBtn.cloneNode(true);
                sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
                
                // Add new listener
                newSendBtn.addEventListener("click", () => {
                    console.log(`[Chat] Send button clicked for ${this.selectedImageIndices.size} image(s)`);
                    const selectedFiles = Array.from(this.selectedImageIndices).map(idx => files[idx]);
                    this.processAndSendImages(selectedFiles);
                });
            }
            
            // Show modal
            console.log(`[Chat] Showing preview modal`);
            try {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                console.log(`[Chat] Preview modal shown`);
            } catch (err) {
                console.error(`[Chat] Error showing modal:`, err);
            }
        }
        
        /**
         * Update thumbnail selection state visually
         */
        updateThumbnailSelection() {
            const thumbnails = document.querySelectorAll("#imageThumbnails > div");
            thumbnails.forEach((thumb) => {
                const index = parseInt(thumb.dataset.imageIndex);
                const checkmark = thumb.querySelector("div:last-child");
                
                if (this.selectedImageIndices.has(index)) {
                    thumb.style.borderColor = "#34A8E0";
                    thumb.style.opacity = "1";
                    if (checkmark) checkmark.style.opacity = "1";
                } else {
                    thumb.style.borderColor = "transparent";
                    thumb.style.opacity = "0.5";
                    if (checkmark) checkmark.style.opacity = "0";
                }
            });
        }
        
        /**
         * Update send button text with count
         */
        updateSendButtonText(files) {
            const sendImageCount = document.getElementById("sendImageCount");
            if (sendImageCount) {
                const count = this.selectedImageIndices.size;
                if (count > 1) {
                    sendImageCount.textContent = `(${count})`;
                } else if (count === 1) {
                    sendImageCount.textContent = "";
                } else {
                    sendImageCount.textContent = "(0)";
                }
            }
        }

        /**
         * Update the preview image when navigating through multiple images
         */
        updateImagePreview(files) {
            const previewImg = document.getElementById("previewModalImage");
            const imageCounter = document.getElementById("imageCounter");
            
            if (previewImg) {
                previewImg.src = this.pendingImageDataUrls[this.currentImageIndex];
                console.log(`[Chat] Preview image updated to image ${this.currentImageIndex + 1}`);
            }
            
            if (imageCounter) {
                imageCounter.textContent = `${this.currentImageIndex + 1} / ${files.length}`;
            }
        }

        /**
         * Process and send all pending images
         */
        processAndSendImages(files) {
            let imagesProcessed = 0;
            
            files.forEach((file, index) => {
                this.compressImage(file, (compressedDataUrl) => {
                    console.log(`[Chat] Compressed image ${index + 1}/${files.length}, adding to pending attachments...`);
                    this.pendingAttachments = this.pendingAttachments || [];
                    this.pendingAttachments.push({
                        file: file,
                        dataUrl: compressedDataUrl
                    });
                    
                    imagesProcessed++;
                    
                    // When all images are processed, send the message
                    if (imagesProcessed === files.length) {
                        console.log(`[Chat] All ${files.length} images processed, creating message...`);
                        this.createFileMessage();
                        const modal = document.getElementById("imagePreviewModal");
                        const bsModal = bootstrap.Modal.getInstance(modal);
                        if (bsModal) bsModal.hide();
                    }
                });
            });
        }

        /**
         * Create a file message with single or multiple attachments
         */
        createFileMessage() {
            if (!this.currentChat) {
                alert("Please select a chat first");
                return;
            }

            // Use pending attachments if available
            const attachments = (this.pendingAttachments || []).map((att) => ({
                id: Date.now() + Math.random(),
                name: att.file.name,
                type: att.file.type,
                size: att.file.size,
                url: att.dataUrl,
            }));

            if (attachments.length === 0) {
                console.warn(`[Chat] No attachments to send`);
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
                attachments: attachments,
            };

            console.log(`[Chat] Created file message with ${attachments.length} attachment(s):`, newMessage);
            attachments.forEach((att, idx) => {
                console.log(`[Chat] Attachment ${idx + 1}: ${att.name}, URL length: ${att.url.length}`);
            });

            if (!this.messages[this.currentChat.id]) {
                this.messages[this.currentChat.id] = [];
            }
            this.messages[this.currentChat.id].push(newMessage);

            localStorage.setItem(
                `messages_${this.currentChat.id}`,
                JSON.stringify(this.messages[this.currentChat.id]),
            );

            // Clear pending attachments
            this.pendingAttachments = [];

            this.renderMessages();
            this.renderChatList();
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

            // Mark messages as read
            this.markMessagesAsRead();
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
                this.currentChat.type === "group" ?
                `${this.currentChat.participants.length} members` :
                "1 contact";

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
             console.log(`[Chat] renderMessages: ${messages.length} messages for chat ${this.currentChat.id}`);
             messages.forEach((msg, idx) => {
                 console.log(`  [${idx}] Type: ${msg.type}, Has attachments: ${!!msg.attachments}, Count: ${msg.attachments?.length || 0}`);
                 if (msg.attachments) {
                     msg.attachments.forEach((att, attIdx) => {
                         console.log(`    [att ${attIdx}] Name: ${att.name}, Type: ${att.type}, URL length: ${att.url?.length || 0}`);
                     });
                 }
             });
             
             // Store image URLs for later assignment
             this.imageUrlMap = {};

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
                    const isPinned = this.pinnedMessages[this.currentChat.id]?.includes(
                        msg.id,
                    );
                    const reactions = this.messageReactions[msg.id] || {};
                    const readStatus = this.readReceipts[msg.id] || [];

                    let contentHtml = "";
                    if (msg.type === "text") {
                        contentHtml = `<div class="message-text">${this.escapeHtml(msg.content)}</div>`;
                    } else if (msg.type === "file") {
                        contentHtml = msg.attachments
                            .map((att, idx) => {
                                const isImage = att.type?.startsWith("image/");
                                if (isImage) {
                                    // Ensure URL is properly formatted (should be data URL or blob URL)
                                    const imageUrl = att.url || att.dataUrl || "";
                                    console.log(`[Chat] Rendering image: ${att.name}, URL length: ${imageUrl.length}`);
                                    if (!imageUrl) {
                                        console.warn(`[Chat] No URL for image: ${att.name}`);
                                        return `<div class="message-file image-preview"><div class="image-error">Image not available</div></div>`;
                                    }
                                    // Store URL in map, set via JS after rendering to avoid HTML parsing issues
                                    const uniqueId = `img_${msg.id}_${idx}`;
                                    this.imageUrlMap[uniqueId] = imageUrl;
                                    return `<div class="message-file image-preview"><img id="${uniqueId}" alt="${att.name}" class="preview-thumbnail" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3C/svg%3E"></div>`;
                                } else {
                                   const escapedName = this.escapeHtml(att.name);
                                   const escapedUrl = this.escapeHtml(att.url);
                                    return `
                    <div class="message-file">
                    <div class="d-flex align-items-center">
                    <i class="ri-file-line me-2"></i>
                    <a href="${escapedUrl}" download="${escapedName}" class="text-decoration-none flex-grow-1">
                    ${escapedName} (${this.formatFileSize(att.size)})
                    </a>
                    </div>
                    </div>
                    `;
                                }
                            })
                            .join("");
                    }

                    const senderNameHtml = !isOwn && this.currentChat.type === "group" ?
                        `<span class="message-sender-name">${msg.senderName}</span>` :
                        "";

                    const reactionsHtml =
                        Object.keys(reactions).length > 0 ?
                        `<div class="message-reactions">${Object.keys(reactions)
                  .map(
                    (emoji) =>
                      `<span class="reaction-emoji" title="${reactions[emoji].join(", ")}">${emoji} ${reactions[emoji].length > 1 ? reactions[emoji].length : ""}</span>`,
                  )
                  .join("")}</div>` :
                        "";

                    const pinnedIndicator = isPinned ?
                        '<div class="message-pinned-indicator"><i class="ri-pushpin-fill"></i> Pinned</div>' :
                        "";

                    const readReceiptsHtml =
                        isOwn && readStatus.length > 0 ?
                        `<small class="message-read-receipt" title="Read by: ${readStatus.join(", ")}"><i class="ri-check-double-line"></i></small>` :
                        "";

                    const messageActions = `
            <div class="message-actions">
              <button class="msg-action-btn" onclick="chatSystem.toggleReactionPicker(event, '${msg.id}')" title="React">
                <i class="ri-emotion-smile-line"></i>
              </button>
              <button class="msg-action-btn" onclick="chatSystem.pinMessage('${msg.id}')" title="${isPinned ? "Unpin" : "Pin"}">
                <i class="ri-pushpin-line"></i>
              </button>
              ${
                isOwn
                  ? `
              <button class="msg-action-btn" onclick="chatSystem.editMessage('${msg.id}')" title="Edit">
                <i class="ri-edit-line"></i>
              </button>
              <button class="msg-action-btn" onclick="chatSystem.deleteMessage('${msg.id}')" title="Delete">
                <i class="ri-delete-bin-line"></i>
              </button>
              `
                  : ""
              }
            </div>
          `;

                    return `
        <div class="message-group ${isOwn ? "text-end" : ""}" data-message-id="${msg.id}">
          ${!isOwn ? `<div class="message-avatar">${senderInitials}</div>` : ""}
          <div class="message-wrapper">
            ${senderNameHtml}
            ${pinnedIndicator}
            <div class="message-item">
              ${contentHtml}
              <small class="message-time">${timeStr}</small>
              ${readReceiptsHtml}
            </div>
            ${reactionsHtml}
            ${messageActions}
          </div>
        </div>
      `;
                })
                .join("");

            container.innerHTML = messagesHtml;

            // Scroll to bottom to show new messages
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 50);

            // Add click handlers for image previews and set actual image URLs
            setTimeout(() => {
                container.querySelectorAll(".preview-thumbnail").forEach((img) => {
                    // Set the actual image URL from the map
                    const imageId = img.id;
                    if (this.imageUrlMap[imageId]) {
                        img.src = this.imageUrlMap[imageId];
                        console.log(`[Chat] Set image source for ${img.alt}, URL length: ${this.imageUrlMap[imageId].length}`);
                    }
                    
                    img.style.cursor = "pointer";
                    img.addEventListener("click", (e) => {
                        e.stopPropagation();
                        console.log(`[Chat] Image clicked: ${img.alt}`);
                        this.openImageModal(img.src, img.alt);
                    });
                    // Log when image loads
                    img.addEventListener('load', () => {
                        console.log(`[Chat] Image loaded: ${img.alt}`);
                    });
                    img.addEventListener('error', () => {
                        console.error(`[Chat] Image failed to load: ${img.alt}`);
                    });
                });
            }, 100);
        }

        /**
         * Open image in a modal viewer (WhatsApp style)
         */
        openImageModal(imageSrc, imageName) {
            let modal = document.getElementById("imageViewerModal");
            if (!modal) {
                const modalHtml = `
                    <div class="modal fade" id="imageViewerModal" tabindex="-1">
                        <div class="modal-dialog modal-fullscreen">
                            <div class="modal-content bg-dark border-0">
                                <div class="modal-header border-0 bg-dark" style="padding: 12px 20px;">
                                    <div class="d-flex align-items-center gap-3" style="flex: 1;">
                                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                                        <small class="text-light" id="imageViewerTime" style="opacity: 0.7;"></small>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-light" title="Download" onclick="this.closest('.modal').querySelector('#imageViewerImg').download = true; this.closest('.modal').querySelector('#imageViewerImg').click();">
                                        <i class="ri-download-2-line"></i>
                                    </button>
                                </div>
                                <div class="modal-body d-flex align-items-center justify-content-center p-0" style="background: #000;">
                                    <img id="imageViewerImg" src="" alt="" style="max-width: 100%; max-height: 100vh; object-fit: contain;">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML("beforeend", modalHtml);
                modal = document.getElementById("imageViewerModal");
            }

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById("imageViewerTime").textContent = timeStr;
            document.getElementById("imageViewerImg").src = imageSrc;
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
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
                    return user ?
                        `<li>${user.full_name} (${user.role === "patient" ? "Patient" : "Health Worker"})</li>` :
                        "";
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

        /**
         * Toggle message search UI
         */
        toggleMessageSearch() {
            const searchUI = document.getElementById("chatMessageSearch");
            if (searchUI) {
                searchUI.style.display =
                    searchUI.style.display === "none" ? "flex" : "none";
                if (searchUI.style.display !== "none") {
                    document.getElementById("messageSearchInput").focus();
                }
            }
        }

        /**
         * Search messages
         */
        searchMessages(query) {
            this.searchQuery = query.toLowerCase();
            if (!this.currentChat || !this.messages[this.currentChat.id]) return;

            const messages = this.messages[this.currentChat.id];
            const container = document.getElementById("chatMessagesContainer");

            if (!query) {
                this.renderMessages();
                return;
            }

            const filtered = messages.filter(
                (msg) =>
                msg.content.toLowerCase().includes(query) ||
                msg.senderName.toLowerCase().includes(query),
            );

            const html =
                filtered.length > 0 ?
                filtered
                .map((msg) => {
                    const isOwn = msg.senderId === this.currentUser.id;
                    const timeStr = this.formatTime(msg.timestamp);
                    const senderInitials = this.getInitials(msg.senderName);
                    let contentHtml = `<div class="message-text" style="background: #ffffcc;">${this.escapeHtml(msg.content)}</div>`;
                    const senderNameHtml = !isOwn && this.currentChat.type === "group" ?
                        `<span class="message-sender-name">${msg.senderName}</span>` :
                        "";
                    return `
        <div class="message-group ${isOwn ? "text-end" : ""}" data-message-id="${msg.id}">
          ${!isOwn ? `<div class="message-avatar">${senderInitials}</div>` : ""}
          <div class="message-wrapper">
            ${senderNameHtml}
            <div class="message-item">
              ${contentHtml}
              <small class="message-time">${timeStr}</small>
            </div>
          </div>
        </div>`;
                })
                .join("") :
                `<div class="text-center text-muted py-5">No messages match "${query}"</div>`;

            container.innerHTML = html;
        }

        /**
         * Broadcast typing indicator
         */
        broadcastTypingIndicator() {
            if (this.typingTimeout) clearTimeout(this.typingTimeout);

            this.typingUsers.add(this.currentUser.id);
            this.showTypingIndicator();

            this.typingTimeout = setTimeout(() => {
                this.typingUsers.delete(this.currentUser.id);
                this.hideTypingIndicator();
            }, 3000);
        }

        /**
         * Show typing indicator
         */
        showTypingIndicator() {
            const indicator = document.getElementById("typingIndicator");
            const typingText = document.getElementById("typingText");
            if (indicator && this.typingUsers.size > 0) {
                const typingUsers = Array.from(this.typingUsers)
                    .map((id) => {
                        const user = JSON.parse(
                            localStorage.getItem("allUsers") || "[]",
                        ).find((u) => u.id === id);
                        return user?.full_name.split(" ")[0] || "Someone";
                    })
                    .join(", ");
                typingText.textContent = `${typingUsers} ${this.typingUsers.size > 1 ? "are" : "is"} typing...`;
                indicator.style.display = "flex";
            }
        }

        /**
         * Hide typing indicator
         */
        hideTypingIndicator() {
            const indicator = document.getElementById("typingIndicator");
            if (indicator && this.typingUsers.size === 0) {
                indicator.style.display = "none";
            }
        }

        /**
         * Toggle reaction picker
         */
        toggleReactionPicker(event, messageId) {
            event.stopPropagation();
            const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "✨", "👏"];
            const picker = document.createElement("div");
            picker.className = "emoji-picker";
            picker.style.position = "absolute";
            picker.style.background = "white";
            picker.style.border = "1px solid #ddd";
            picker.style.borderRadius = "8px";
            picker.style.padding = "8px";
            picker.style.display = "grid";
            picker.style.gridTemplateColumns = "repeat(4, 1fr)";
            picker.style.gap = "4px";
            picker.style.zIndex = "1050";

            emojis.forEach((emoji) => {
                const btn = document.createElement("button");
                btn.textContent = emoji;
                btn.style.border = "none";
                btn.style.background = "#f0f0f0";
                btn.style.padding = "6px";
                btn.style.cursor = "pointer";
                btn.style.fontSize = "1.2rem";
                btn.style.borderRadius = "4px";
                btn.onclick = () => this.addReaction(messageId, emoji);
                picker.appendChild(btn);
            });

            document.body.appendChild(picker);
            const rect = event.target.getBoundingClientRect();
            picker.style.top = rect.bottom + "px";
            picker.style.left = rect.left + "px";

            setTimeout(() => {
                document.addEventListener("click", function closeEmojiPicker() {
                    picker.remove();
                    document.removeEventListener("click", closeEmojiPicker);
                });
            }, 0);
        }

        /**
         * Add reaction to message
         */
        addReaction(messageId, emoji) {
            if (!this.messageReactions[messageId]) {
                this.messageReactions[messageId] = {};
            }
            if (!this.messageReactions[messageId][emoji]) {
                this.messageReactions[messageId][emoji] = [];
            }
            if (
                !this.messageReactions[messageId][emoji].includes(
                    this.currentUser.full_name,
                )
            ) {
                this.messageReactions[messageId][emoji].push(
                    this.currentUser.full_name,
                );
            }
            this.renderMessages();
        }

        /**
         * Pin message
         */
        pinMessage(messageId) {
            if (!this.currentChat) return;
            const chatId = this.currentChat.id;
            if (!this.pinnedMessages[chatId]) {
                this.pinnedMessages[chatId] = [];
            }
            const index = this.pinnedMessages[chatId].indexOf(messageId);
            if (index > -1) {
                this.pinnedMessages[chatId].splice(index, 1);
            } else {
                this.pinnedMessages[chatId].push(messageId);
            }
            this.renderMessages();
        }

        /**
         * Edit message
         */
        editMessage(messageId) {
            if (!this.currentChat || !this.messages[this.currentChat.id]) return;
            const msg = this.messages[this.currentChat.id].find(
                (m) => m.id === messageId,
            );
            if (msg && msg.type === "text") {
                const newContent = prompt("Edit message:", msg.content);
                if (newContent && newContent.trim()) {
                    msg.content = newContent.trim();
                    msg.edited = true;
                    msg.editedAt = new Date().toISOString();
                    this.renderMessages();
                    this.saveMessages();
                }
            }
        }

        /**
         * Delete message
         */
        deleteMessage(messageId) {
            if (!confirm("Delete this message?")) return;
            if (!this.currentChat || !this.messages[this.currentChat.id]) return;
            const index = this.messages[this.currentChat.id].findIndex(
                (m) => m.id === messageId,
            );
            if (index > -1) {
                this.messages[this.currentChat.id].splice(index, 1);
                this.renderMessages();
                this.saveMessages();
            }
        }

        /**
         * Mark messages as read
         */
        markMessagesAsRead() {
            if (!this.currentChat || !this.messages[this.currentChat.id]) return;
            const messages = this.messages[this.currentChat.id];
            messages.forEach((msg) => {
                if (msg.senderId !== this.currentUser.id) {
                    if (!this.readReceipts[msg.id]) {
                        this.readReceipts[msg.id] = [];
                    }
                    if (!this.readReceipts[msg.id].includes(this.currentUser.full_name)) {
                        this.readReceipts[msg.id].push(this.currentUser.full_name);
                    }
                }
            });
            this.renderMessages();
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