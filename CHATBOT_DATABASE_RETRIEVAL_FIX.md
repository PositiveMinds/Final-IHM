# Chatbot Database Retrieval - Implementation Guide

## Overview
The HealthFlow AI Chatbot has been enhanced to properly retrieve patient data from the Supabase database based on natural language queries. The chatbot now supports multiple query patterns and automatically matches user queries to database filters.

## Key Improvements Made

### 1. **Enhanced Intent Detection**
The chatbot now uses two-phase intent detection:
- **Pattern Matching**: Recognizes keywords like "show", "list", "find", "how many", etc.
- **Filter-Based Fallback**: If no intent pattern matches but filters are extracted from the query, it defaults to `patient_search`

### 2. **Improved Filter Extraction**
The chatbot can now extract the following filters from natural language queries:

#### Condition Filters
- `HIV/AIDS` - Keywords: "hiv", "aids", "positive", "negative"
- `Diabetes` - Keywords: "diabetes", "diabetic", "type 2", "t2dm"
- `Hypertension` - Keywords: "hypertension", "high blood pressure", "hbp"
- `TB` - Keywords: "tuberculosis", "tb"
- `Cancer` - Keywords: "cancer"

#### Status Filters
- `Active` - Keyword: "active", "ongoing"
- `Inactive` - Keywords: "inactive", "discharged"
- `Critical` - Keywords: "critical", "alert", "urgent"

#### HIV Status Filters
- `Positive` - Keywords: "positive", "hiv+", "confirmed"
- `Negative` - Keywords: "negative", "hiv-", "uninfected"

#### Viral Load Filters
- `Detectable` - Keyword: "detectable"
- `Undetectable` - Keyword: "undetectable"

#### Demographics
- `Gender` - Keywords: "male", "female", "men", "women"
- `Age Range` - Pattern: "age 50", "over 60", "above 45"

#### Patient ID
- Pattern: "patient PAT0025", "patient 0025", "patient number 123"

### 3. **Error Handling**
All database queries now have proper error handling with user-friendly messages:
- Connection errors are caught and reported
- Missing or invalid data triggers helpful suggestions
- All errors are logged to console for debugging

### 4. **Intent Types Supported**

#### `patient_search`
Returns list of patients matching filter criteria
- **Example queries:**
  - "Show me all HIV positive patients"
  - "List female patients with diabetes"
  - "Find patients with critical status"
  - "What patients are over 50 years old?"

#### `patient_stats`
Returns statistics about patients
- **Example queries:**
  - "How many active patients do we have?"
  - "Total number of patients"
  - "Statistics for diabetes patients"
  - "Count critical patients"

#### `viral_load`
Shows viral load status for patients
- **Example queries:**
  - "Show patients with detectable viral load"
  - "List undetectable patients"
  - "What's the viral load status?"

#### `appointments`
Lists upcoming appointments
- **Example queries:**
  - "Show upcoming appointments"
  - "What appointments are scheduled?"
  - "When are the next visits?"

#### `high_risk`
Shows critical/at-risk patients
- **Example queries:**
  - "Show critical patients"
  - "List high-risk patients"
  - "Which patients need urgent attention?"

#### `specific_patient`
Retrieves details for a specific patient
- **Example queries:**
  - "Show patient PAT0025"
  - "Details for patient 123"

## How to Test the Chatbot

### Testing Environment
1. Open `dashboard.html` in a web browser
2. Click the chatbot button (💬) in the bottom right corner
3. Type natural language queries

### Test Queries
```
Basic patient search:
- "Show me all HIV positive patients"
- "List patients with diabetes"
- "Find female patients"

Statistics:
- "How many active patients do we have?"
- "Count critical patients"

Specific conditions:
- "Show patients with detectable viral load"
- "List tuberculosis patients"
- "Find hypertension patients"

Demographics:
- "Show male patients"
- "Find patients age 50 and above"
- "List female patients with HIV"

Appointments:
- "Show upcoming appointments"
- "When are the next visits?"

High-Risk:
- "Show critical patients"
- "List high-risk patients"
```

## Technical Details

### Database Connection
The chatbot uses the global `window.supabaseClient` object which is initialized by:
1. Loading Supabase library: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
2. Running `supabase-config.js` which creates the client with credentials

### Query Flow
```
User Query
    ↓
detectIntent() - Identify query type
    ↓
extractFilters() - Parse natural language to SQL-like filters
    ↓
queryPatients() / getStatistics() - Execute Supabase query
    ↓
formatResponse() - Convert results to readable format
    ↓
Display in Chat UI
```

### File Structure
- `dashboard.html` - Contains the HTML structure and loads scripts
- `assets/js/chatbot-ai.js` - Core chatbot logic and database queries
- `assets/js/chatbot-ui.js` - Chat interface and user interactions
- `assets/css/chatbot.css` - Styling for the chatbot
- `supabase-config.js` - Supabase initialization

## Debugging

### Console Logs
The chatbot logs detailed information to the browser console:
- `Detected intent: [intent_type]`
- `Extracted filters: [filter_object]`
- `Query filters: [applied_filters]`
- `Query results count: [number]`
- `Available [field] values: [all_values]`

### Troubleshooting

**Chatbot not responding:**
1. Check browser console for errors
2. Verify Supabase connection: Look for "Supabase client initialized"
3. Ensure database tables exist: `patients`, `appointments`, `clinical_notes`

**Getting "No patients found":**
1. Check console logs to see what filters were extracted
2. Verify the actual field values in the database
3. Try queries with fewer filters first

**Database connection errors:**
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY in `supabase-config.js`
2. Check that the Supabase project is accessible
3. Ensure CORS is properly configured in Supabase

## Future Enhancements

Potential improvements to consider:
1. Add more condition types (Malaria, Asthma, etc.)
2. Support date range filtering for appointments
3. Add patient history and trend analysis
4. Support for custom saved searches
5. Integration with SMS/email notifications
6. Multi-language support

## Support

For issues or questions about the chatbot implementation:
1. Check the console logs for detailed error messages
2. Review the query flow documentation above
3. Test with simpler queries first to isolate issues
4. Verify database connectivity with basic queries
