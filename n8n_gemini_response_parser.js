/**
 * N8N Gemini Response Parser
 * Extracts and normalizes Gemini AI output to flat JSON structure
 */

const geminiOutput = $input.all();
const geminiData = geminiOutput[0].json;

// Extract text from Gemini response structure
let rawText = '';
if (geminiData.content && geminiData.content.parts && geminiData.content.parts[0]) {
  rawText = geminiData.content.parts[0].text;
}

// Extract JSON from markdown code block
let extractedJson = null;
const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
if (jsonMatch) {
  try {
    extractedJson = JSON.parse(jsonMatch[1]);
  } catch (e) {
    const simpleJsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (simpleJsonMatch) {
      try {
        extractedJson = JSON.parse(simpleJsonMatch[0]);
      } catch (e2) {
        // Continue with empty
      }
    }
  }
}

const aiData = extractedJson || {};

// Extract contact name from emailBody
function extractContactName(htmlContent) {
  const match = htmlContent.match(/Dear\s+([A-Za-z\s]+),/);
  return match ? match[1].trim() : '';
}

const emailBody = aiData.emailBody || '';
const contactName = extractContactName(emailBody);

// Parse scheduled date and time
function parseDateTime(dateTimeStr) {
  // Format: "2026-01-12 10:00 AM"
  const match = dateTimeStr.match(/(\d{4}-\d{2}-\d{2})\s+(.+)/);
  return match ? { date: match[1], time: match[2] } : { date: '', time: '' };
}

const { date: scheduledDate, time: scheduledTime } = parseDateTime(aiData.scheduledDateTime || '');

// Build flat JSON response
const result = {
  // Status and IDs
  status: 'success',
  demoId: aiData.demoId || '',
  timestamp: new Date().toISOString(),
  
  // Contact Information
  contactName: contactName,
  email: aiData['Client Email'] || '',
  phone: aiData.phone || '',
  
  // Facility Information
  facility: aiData.facilityName || '',
  facilityType: aiData['facility type'] || 'health-center',
  patientLoad: aiData['patient load'] || '',
  
  // Demo Details
  demoDate: aiData['demo date'] || scheduledDate,
  demoTime: aiData['preferred time'] || scheduledTime,
  scheduledDateTime: aiData.scheduledDateTime || '',
  
  // Interests
  interests: aiData.interests || '',
  
  // Communication
  assignedRepresentative: aiData.assignedRep || '',
  nextSteps: aiData.nextSteps || '',
  
  // Email Details
  emailSubject: aiData.emailSubject || '',
  emailBody: aiData.emailBody || '',
  
  // Brand Colors
  primaryColor: '#EAB34B',
  accentColor: '#15696B',
  
  // Metadata
  createdAt: new Date().toISOString(),
  source: 'n8n-gemini-webhook'
};

return [{ json: result }];
