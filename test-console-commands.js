// Copy and paste these commands into your browser console (F12) to test image functionality

// ============================================
// 1. CHECK IF CHAT SYSTEM IS LOADED
// ============================================
console.log('ChatSystem loaded:', typeof ChatSystem === 'function');
console.log('chatSystem instance exists:', typeof window.chatSystem === 'object');

// ============================================
// 2. CHECK STORED MESSAGES
// ============================================
const messageKeys = Object.keys(localStorage).filter(k => k.startsWith('messages_'));
console.log('Chat message keys stored:', messageKeys);
console.log('Number of chats:', messageKeys.length);

if (messageKeys.length > 0) {
  messageKeys.forEach(key => {
    const msgs = JSON.parse(localStorage.getItem(key));
    console.log(`\n${key}:`);
    msgs.forEach((msg, idx) => {
      if (msg.type === 'file') {
        console.log(`  Message ${idx}: TYPE=FILE`);
        msg.attachments.forEach(att => {
          console.log(`    - ${att.name} (${att.type})`);
          console.log(`      URL length: ${att.url?.length || 0}`);
          console.log(`      URL valid: ${att.url?.startsWith('data:image') || false}`);
        });
      }
    });
  });
}

// ============================================
// 3. CHECK DOM FOR IMAGE ELEMENTS
// ============================================
const images = document.querySelectorAll('.preview-thumbnail');
console.log(`\nImage elements in DOM: ${images.length}`);
if (images.length > 0) {
  images.forEach((img, idx) => {
    console.log(`\nImage ${idx}:`);
    console.log(`  src length: ${img.src?.length || 0}`);
    console.log(`  src valid: ${img.src?.startsWith('data:image') || false}`);
    console.log(`  alt: ${img.alt}`);
    console.log(`  display: ${window.getComputedStyle(img).display}`);
    console.log(`  dimensions: ${img.offsetWidth}x${img.offsetHeight}`);
    console.log(`  naturalDimensions: ${img.naturalWidth}x${img.naturalHeight}`);
  });
}

// ============================================
// 4. CHECK CONTAINER STYLING
// ============================================
const container = document.querySelector('.message-file.image-preview');
if (container) {
  const style = window.getComputedStyle(container);
  console.log('\nImage container styling:');
  console.log(`  display: ${style.display}`);
  console.log(`  flex-direction: ${style.flexDirection}`);
  console.log(`  gap: ${style.gap}`);
  console.log(`  background: ${style.background}`);
  console.log(`  height: ${style.height}`);
  console.log(`  visibility: ${style.visibility}`);
} else {
  console.log('\nImage container not found!');
}

// ============================================
// 5. FORCE DISPLAY TEST
// ============================================
console.log('\n=== ATTEMPTING TO FORCE DISPLAY ===');
document.querySelectorAll('.preview-thumbnail').forEach((img, idx) => {
  img.style.display = 'block';
  img.style.visibility = 'visible';
  img.style.opacity = '1';
  console.log(`Forced display on image ${idx}`);
});

// ============================================
// 6. TEST IMAGE URL VALIDITY
// ============================================
if (messageKeys.length > 0) {
  const msgs = JSON.parse(localStorage.getItem(messageKeys[0]));
  const imageMsg = msgs.find(m => m.type === 'file' && m.attachments);
  
  if (imageMsg) {
    const url = imageMsg.attachments[0].url;
    console.log(`\nTesting image URL:`);
    
    const testImg = new Image();
    testImg.onload = () => {
      console.log('✓ Image URL is VALID and LOADS successfully');
      console.log(`  Dimensions: ${testImg.naturalWidth}x${testImg.naturalHeight}`);
    };
    testImg.onerror = () => {
      console.error('✗ Image URL FAILED to load - possible data corruption');
    };
    testImg.src = url;
  }
}

console.log('\n=== TEST COMPLETE ===');
