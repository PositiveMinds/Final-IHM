# Multiple File Upload Feature - Implementation Guide

## Overview
The chat system on dashboard.html now supports uploading multiple files (images and PDFs) in a single message.

## Features Implemented

### 1. Multi-File Selection
- Users can select multiple files at once using the file picker
- File input has `multiple` attribute enabled
- Supports mixing images and PDFs in one selection

### 2. Smart File Processing
- **Images**: Displayed in an interactive carousel preview before sending
- **PDFs/Non-Images**: Automatically added to pending attachments
- Files are validated for type and size (max 10MB per file)

### 3. Image Carousel Preview Modal
- Shows all selected images in a carousel
- Navigation controls: **← [1/3] →** to browse through images
- Image counter displays current position (e.g., "2 / 5")
- Send button shows file count (e.g., "Send (3)")
- Users can preview all images before confirming

### 4. Single Message with Multiple Attachments
- All selected files are bundled into one message
- Attachments remain grouped in the chat
- Each attachment displays with filename and size
- Images show as thumbnails (clickable to expand full-size)

## Technical Architecture

### Modified Functions

#### handleFileUpload(event)
- Separates images and non-images into two arrays
- Processes PDFs/files immediately via FileReader
- Collects images for carousel preview
- Stores file data in `this.pendingAttachments` array

#### showImagePreviewModal(files)
- Accepts single file or array of files
- Loads all images asynchronously
- Waits for all images to load before displaying modal
- Initializes carousel state

#### displayImagePreviewModal(files)
- Creates/reuses the preview modal DOM
- Sets up navigation controls (hide if only 1 image)
- Initializes image counter and carousel state
- Sets up send button listener

#### updateImagePreview(files)
- Updates displayed image when user navigates
- Updates counter text (e.g., "2 / 5")
- Maintains current index state

#### processAndSendImages(files)
- Compresses all images in parallel
- Collects compressed data in `pendingAttachments`
- Sends single message when all images processed
- Closes preview modal after sending

#### createFileMessage()
- **No longer takes parameters**
- Reads from `this.pendingAttachments` array
- Creates message with all pending attachments
- Clears pending attachments after sending

## Data Structure

### Pending Attachments Array
```javascript
this.pendingAttachments = [
  {
    file: File,          // Original file object
    dataUrl: string      // Data URL (image or PDF)
  },
  {
    file: File,
    dataUrl: string
  }
]
```

### Message with Attachments
```javascript
{
  id: timestamp,
  chatId: string,
  senderId: string,
  senderName: string,
  content: "",           // Empty for file-only messages
  timestamp: ISO string,
  type: "file",
  attachments: [
    {
      id: unique id,
      name: "image1.jpg",
      type: "image/jpeg",
      size: 12345,
      url: "data:image/jpeg;base64,..."
    },
    {
      id: unique id,
      name: "document.pdf",
      type: "application/pdf",
      size: 54321,
      url: "data:application/pdf;base64,..."
    }
  ]
}
```

## User Workflow

1. **Open chat** → Click file upload button (📎)
2. **Select files** → Choose multiple images and/or PDFs
3. **Preview (if images)** → Carousel modal shows all images
   - Browse with ← → buttons
   - See counter (1/5, 2/5, etc.)
4. **Send** → Click "Send (n)" button
5. **Message appears** → All files grouped in one bubble

## Edge Cases Handled

- **Single file**: Works as before, no carousel counter shown
- **Mixed files**: Images in carousel, PDFs added immediately
- **Only PDFs**: No preview modal, sent directly after FileReader
- **Invalid files**: Alerted and skipped, valid files still process
- **File size limit**: 10MB max per file, enforced before processing
- **Multiple modals**: Reuses existing modal if opened again

## Console Logging

New logs added for debugging:
```
[Chat] Files selected: 3
[Chat] Image detected, collecting for preview...
[Chat] Preparing preview modal for 3 image(s)
[Chat] Image 1 loaded for preview, size: 45678
[Chat] Showing preview modal for 3 image(s)
[Chat] Compressed image 1/3, adding to pending attachments...
[Chat] All 3 images processed, creating message...
[Chat] Created file message with 3 attachment(s)
```

## Browser Compatibility
- Modern browsers with FileReader API support
- Bootstrap 5 Modal functionality required
- ES6 features (arrow functions, template literals)

## Backward Compatibility
- Single file uploads still work
- Message rendering unchanged
- Existing chats with single attachments unaffected
- API remains compatible with old message format
