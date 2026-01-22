# Enhanced Chatbot Features - Complete Guide

## Overview
The HealthFlow AI Chatbot has been enhanced with powerful new features to help you retrieve and analyze patient data efficiently.

---

## New Features Implemented

### 1. Date Range Filtering for Appointments
Query appointments within specific date ranges using natural language.

**Supported Patterns:**
```
- "Appointments from last 30 days"
- "Show appointments from last 7 days"
- "Appointments from last 3 months"
- "Appointments between 01/01/2024 and 12/31/2024"
- "Show appointments after 01/15/2024"
- "Appointments until 02/28/2024"
```

**Database Queries:**
- Automatically filters `next_appointment` field against `dateRange`
- Supports both relative dates (last X days/weeks/months) and absolute dates (MM/DD/YYYY)

---

### 2. Patient Trends & Historical Analysis
Analyze patient populations for trends and insights.

**Usage Examples:**
```
- "Show me patient trends"
- "What are the trends for HIV positive patients?"
- "Analyze patient trends with diabetes"
- "Show trends for critical patients"
```

**Data Provided:**
- Total patients analyzed
- Average age
- Status distribution (Active vs Critical)
- Viral load progress (Undetectable vs Detectable)
- Improvement rate percentage

**Code Implementation:**
```javascript
// In chatbot-ai.js
analyzePatientTrends(filters) // Returns detailed trend analysis
```

---

### 3. Custom Saved Searches
Save frequently used search queries for quick access.

**How to Save:**
```
Option 1: Click "💾 Save Search" button after results
Option 2: Ask the chatbot:
  - "Save this as HIV Positive Patients"
  - "Save as my favorite search"
  - "Remember this as diabetes screening"

Option 3: Direct method:
  - healthFlowChatbot.saveSearch('My Search Name', filters)
```

**Persistence:**
- Searches are stored in browser's localStorage
- Automatically loaded when page is refreshed
- No server sync needed (local storage only)

**Retrieve Saved Searches:**
```
- Click "📋 My Searches" button
- Or ask: "Show my saved searches"
- Or: healthFlowChatbot.listSavedSearches()
```

---

### 4. Natural Language Understanding Improvements
Enhanced NLP with new intent detection patterns.

**New Intents Recognized:**
- `patient_trends` - For trend and history analysis
- `save_search` - For saving current search
- `appointments` - Enhanced with date pattern matching

**Improved Filter Extraction:**
- Dates (last N days/weeks/months)
- Date ranges (between/from-to)
- All existing filters (condition, status, gender, age, etc.)

**Keywords Now Supported:**
```
Dates: "last 7 days", "30 days ago", "between", "after", "before"
Trends: "trend", "history", "progress", "improvement", "change"
Searches: "save", "store", "remember", "bookmark"
```

---

### 5. Quick Action Buttons
After receiving results, you can:

1. **💾 Save Search** - Save the current query for reuse
2. **📋 My Searches** - View all saved searches
3. **📥 Export** - Export results (coming soon - CSV/PDF)

---

## Conversation Examples

### Example 1: Date Range Filtering
```
User: "Show me appointments from last 30 days"
Bot: [Queries database for appointments in the last 30 days]
     [Displays results with dates]
     [Shows quick action buttons]
```

### Example 2: Patient Trends
```
User: "Analyze trends for HIV positive patients"
Bot: [Fetches all HIV positive patients]
     [Calculates statistics and trends]
     [Shows improvement rates and status distribution]
```

### Example 3: Save and Reuse Search
```
User: "Show HIV positive patients"
Bot: [Displays results]
User: "Save this as HIV Screening"
Bot: "✓ Search 'HIV Screening' has been saved!"

Later...
User: "Use my HIV Screening search"
Bot: [Would run the saved search]
```

---

## Technical Details

### Database Queries Enhanced

**Date Range Filtering:**
```javascript
if (filters.dateRange) {
  if (filters.dateRange.startDate) {
    query = query.gte("next_appointment", filters.dateRange.startDate);
  }
  if (filters.dateRange.endDate) {
    query = query.lte("next_appointment", filters.dateRange.endDate);
  }
}
```

### LocalStorage Schema

**Saved Searches Format:**
```json
[
  {
    "id": 1234567890,
    "name": "HIV Positive Patients",
    "filters": {
      "hiv_status": "Positive",
      "patient_no": null,
      "status": "Active",
      "dateRange": null
    },
    "createdAt": "2024-01-22T10:30:00Z"
  }
]
```

### Methods Available

**For Developers:**

```javascript
// Process user message
healthFlowChatbot.processMessage(userMessage)

// Extract filters from text
healthFlowChatbot.extractFilters(query)

// Extract date ranges
healthFlowChatbot.extractDateRange(query)

// Analyze trends
healthFlowChatbot.analyzePatientTrends(filters)

// Save/Load searches
healthFlowChatbot.saveSearch(name, filters)
healthFlowChatbot.getSavedSearch(name)
healthFlowChatbot.listSavedSearches()
healthFlowChatbot.loadSavedSearches()

// UI Methods
chatbotUI.promptSaveSearch(query)
chatbotUI.showSavedSearches()
chatbotUI.exportResults()
```

---

## Current Limitations & Future Enhancements

### ✓ Currently Supported
- [x] Date range filtering (relative and absolute dates)
- [x] Patient trends analysis
- [x] Custom saved searches (localStorage)
- [x] NLP improvements
- [x] Quick action buttons

### 🚧 Planned Features
- [ ] Multi-language support
- [ ] SMS/Email alert integration
- [ ] Voice query support
- [ ] Export to CSV/PDF
- [ ] Cloud sync for saved searches
- [ ] Advanced comparison queries
- [ ] Predictive analytics

---

## Troubleshooting

### Saved Searches Not Persisting
- Check browser localStorage is enabled
- Clear browser cache if issues persist
- Try a different browser

### Date Range Not Working
- Use format: "last X days/weeks/months" or "MM/DD/YYYY"
- Examples: "last 30 days", "between 01/01/2024 and 02/28/2024"

### Trends Not Calculating
- Ensure database has viral load data
- Need at least 2 patients for accurate percentages

---

## Database Schema Requirements

Ensure your Supabase `patients` table has:

| Column | Type | Notes |
|--------|------|-------|
| patient_no | varchar | Patient ID |
| status | varchar | Active, Inactive, Critical |
| hiv_status | varchar | Positive, Negative |
| condition | varchar | HIV/AIDS, Diabetes, Hypertension, TB, Cancer |
| viral_load_status | varchar | Detectable, Undetectable |
| viral_load_copies | integer | Viral load count |
| next_appointment | date | Appointment date |
| gender | char | M, F |
| age | integer | Patient age |

---

## Testing Queries

Try these in the chatbot to test new features:

```
1. "Show me appointments from last 7 days"
2. "Analyze patient trends"
3. "What are the trends for critical patients?"
4. "Show patient trends with diabetes"
5. "Save this as diabetes screening"
6. "Show my saved searches"
7. "Appointments between 01/01/2024 and 02/28/2024"
8. "Last 30 days appointments"
```

---

## Code Files Modified

1. **assets/js/chatbot-ai.js**
   - Added: `extractDateRange()`, `parseDate()`
   - Added: `analyzePatientTrends()`, `saveSearch()`, `getSavedSearch()`
   - Added: `loadSavedSearches()`, `persistSavedSearches()`, `listSavedSearches()`
   - Enhanced: `extractFilters()`, `queryPatients()`, `processMessage()`

2. **assets/js/chatbot-ui.js**
   - Added: `addQuickActions()`, `promptSaveSearch()`, `showSavedSearches()`, `exportResults()`
   - Enhanced: `sendMessage()` with filter extraction

3. **assets/css/chatbot.css**
   - Added: `.chatbot-quick-actions`, `.chatbot-action-btn` styles

---

## Next Steps

To implement remaining features:

### Multi-Language Support
```javascript
// Add language detection and translation
const supportedLanguages = ['en', 'sw', 'lg', 'es'];
```

### Voice Query Support
```javascript
// Integrate Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
```

### SMS/Email Alerts
```javascript
// Would require backend integration
POST /api/alerts/create
```

---

## Support & Questions

For issues or feature requests, refer to the chatbot documentation in the main README or contact the development team.
