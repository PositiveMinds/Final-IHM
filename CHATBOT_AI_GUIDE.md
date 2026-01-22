# HealthFlow AI Chatbot - Professional Implementation Guide

## Overview

A sophisticated AI chatbot system that retrieves patient data from Supabase using natural language processing. The chatbot understands human language queries and returns relevant patient information.

## Components

### 1. **Chatbot AI Core** (`assets/js/chatbot-ai.js`)
- **Purpose**: Natural Language Processing & Database Queries
- **Key Features**:
  - Intent detection (recognizes what user is asking)
  - Filter extraction (parses specific criteria from queries)
  - Supabase integration (queries patient data)
  - Statistics generation
  - Response formatting

### 2. **Chatbot UI** (`assets/js/chatbot-ui.js`)
- **Purpose**: User Interface & Interaction
- **Key Features**:
  - Floating action button (FAB)
  - Message display with avatars
  - Input handling
  - Loading indicators
  - Suggestion buttons

### 3. **Chatbot Styles** (`assets/css/chatbot.css`)
- **Purpose**: Professional styling
- **Features**:
  - Responsive design
  - Gradient theme (purple)
  - Mobile optimized
  - Smooth animations
  - Accessibility

## Supported Query Types

### 1. **Patient Search**
```
- "Show me all HIV positive patients"
- "List patients with diabetes"
- "Find female patients age 50+"
- "Show all active patients"
- "List critical patients"
```

### 2. **Statistics**
```
- "How many patients do we have?"
- "Count of HIV positive patients"
- "Statistics on patient status"
- "How many diabetic patients?"
```

### 3. **Specific Patient**
```
- "Show patient PAT0001"
- "Details for patient number 123"
- "Find patient John Doe"
```

### 4. **Appointments**
```
- "Show upcoming appointments"
- "List patients with next appointment"
- "Who has appointments this week?"
```

### 5. **Viral Load Data**
```
- "Show detectable viral loads"
- "List patients with undetectable viral load"
- "Viral load status for HIV positive patients"
```

### 6. **High Risk Patients**
```
- "Show critical patients"
- "List high-risk patients"
- "Who needs urgent attention?"
```

## How It Works

### Query Processing Flow

```
User Input
    ↓
Intent Detection (What is being asked?)
    ↓
Filter Extraction (Parse specific criteria)
    ↓
Database Query (Fetch from Supabase)
    ↓
Format Response (Present data clearly)
    ↓
Display to User
```

### Intent Recognition

The chatbot recognizes 6 main intent types:

1. **patient_search** - General patient listing queries
2. **patient_stats** - Statistics and counts
3. **specific_patient** - Look up individual patient
4. **appointments** - Appointment information
5. **viral_load** - Viral load data queries
6. **high_risk** - Critical/alert patient queries

### Filter Extraction

Automatically parses:
- **Patient ID/Number** - `patient PAT0001`
- **Status** - `active`, `inactive`, `critical`
- **HIV Status** - `positive`, `negative`
- **Condition** - `diabetes`, `hypertension`, `TB`, `cancer`
- **Viral Load Status** - `detectable`, `undetectable`
- **Gender** - `male`, `female`
- **Age Range** - `age 50+`, `over 30`

## Integration Steps

### 1. **Already Included in index.html**
```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>

<!-- Chatbot -->
<script src="assets/js/chatbot-ai.js"></script>
<script src="assets/js/chatbot-ui.js"></script>

<!-- Chatbot CSS -->
<link rel="stylesheet" href="assets/css/chatbot.css">
```

### 2. **Supabase Configuration**
- Ensure `supabase-config.js` is properly configured with:
  - SUPABASE_URL
  - SUPABASE_ANON_KEY

### 3. **Database Requirements**
- `patients` table must exist with fields from PATIENTS_TABLE_SCHEMA.md

## Usage Examples

### Example 1: List All HIV Positive Patients
```
User: "Show me all HIV positive patients"
Bot: [Displays filtered list with patient details]
```

### Example 2: Get Statistics
```
User: "How many active patients do we have?"
Bot: [Returns count and breakdown by status/condition]
```

### Example 3: Find Critical Cases
```
User: "Show critical patients"
Bot: [Lists all patients with status='Critical']
```

### Example 4: Viral Load Status
```
User: "Which patients have detectable viral load?"
Bot: [Lists patients with viral_load_status='Detectable']
```

## Response Formats

### Single Patient
```
ID: PAT0001 | Name: John Doe
Age: 45 | Gender: M
Status: Active
Condition: HIV/AIDS
HIV Status: Positive
Viral Load: Undetectable
Next Appointment: 2024-02-15
```

### Multiple Patients
Displayed in responsive table format with:
- Patient ID
- Name
- Age
- Status (badge)
- Condition
- HIV Status (color-coded badge)

### Statistics
```
Total Patients: 156
Average Age: 42 years
By Status: Active (120), Inactive (36)
By Condition: HIV/AIDS (80), Diabetes (45), etc.
By HIV Status: Positive (95), Negative (61)
```

## Customization

### Add New Intent
1. Add to `intents` object in `chatbot-ai.js`:
```javascript
new_intent: {
  patterns: ['keyword1', 'keyword2'],
  keywords: ['patient', 'condition']
}
```

2. Add handling in `processMessage()`:
```javascript
} else if (intent === 'new_intent') {
  // Handle new intent
}
```

### Modify Appearance
Edit `assets/css/chatbot.css`:
- Colors: Modify gradient colors
- Size: Adjust width/height
- Position: Change bottom/right values

### Add More Suggestions
Edit `initialSuggestions` array in `chatbot-ui.js`:
```javascript
this.initialSuggestions = [
  "Your suggestion here",
  "Another suggestion"
];
```

## Database Fields Used

The chatbot can filter/display data from:
- `patient_no`, `first_name`, `last_name` - Identification
- `age`, `gender` - Demographics
- `status` - Patient status
- `hiv_status` - HIV test result
- `major_condition` - Primary condition
- `viral_load_status` - VL status
- `viral_load_copies` - VL count
- `next_appointment` - Appointment date
- `notes` - Clinical notes

## Troubleshooting

### Chatbot Not Showing
1. Check if Supabase is initialized
2. Verify scripts loaded in correct order
3. Check browser console for errors
4. Ensure CSS file is linked

### No Results Found
1. Verify patient data exists in database
2. Check filter logic in `extractFilters()`
3. Ensure database connection is working
4. Check Supabase permissions

### Slow Responses
1. Database might be slow - check Supabase status
2. Limit query results (currently 20 patients)
3. Optimize filters for common queries

## Performance Optimization

- Conversation history limited to 50 messages
- Query results limited to 20 records
- Lazy loading of Supabase client
- Minimal DOM manipulation

## Security

- Uses Supabase RLS (Row Level Security) if configured
- No sensitive data displayed in console
- Sanitized input handling
- Secure Supabase anon key usage

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (responsive)

## Future Enhancements

1. **Integration with AI APIs**
   - Google Gemini for advanced NLP
   - Better intent understanding
   - Context-aware responses

2. **Advanced Features**
   - Patient trend analysis
   - Predictive alerts
   - Export functionality
   - Historical queries

3. **Dashboard Integration**
   - Link directly to patient records
   - Real-time patient actions
   - Data synchronization

## Support

For issues or enhancements:
1. Check browser console for errors
2. Verify Supabase configuration
3. Test with sample queries
4. Check network tab for failed requests
