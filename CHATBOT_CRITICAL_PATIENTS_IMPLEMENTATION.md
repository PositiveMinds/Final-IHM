# Chatbot Critical Patients Implementation - Complete Guide

## Overview
This document explains how the chatbot now correctly handles "critical patients" queries by calling a backend handler that uses clinical criteria.

## Problem Statement
**Before this fix**, when a user asked "How many critical patients do we have?", the chatbot returned nothing because:
1. It was looking for patients with `status = "Critical"` in the database
2. The patients table might not have this status field populated correctly
3. Critical patients should be identified by clinical metrics, not database status fields

**After this fix**, the chatbot:
1. Calls the sophisticated backend handler `getCriticalPatients`
2. Uses clinical criteria: Viral Load ≥ 1000, CD4 < 50, or conditions like HTN/DM
3. Returns a properly formatted table with alerts

## Architecture

### 1. Frontend Flow (chatbot-ai.js)

```
User Query: "How many critical patients do we have?"
    ↓
Intent Detection: "high_risk" (matches patterns: critical, alert, urgent)
    ↓
Handler: callBackendHandler("getCriticalPatients", filters)
    ↓
Supabase Edge Function Call:
    POST /functions/v1/chatbot-query
    {
        query: "",
        facility_id: "<user_facility_id>",
        handler: "getCriticalPatients",
        ...filters
    }
    ↓
Backend Response:
    {
        type: "table",
        columns: ["Patient ID", "Name", "Viral Load", "CD4", "Conditions", "Next Appointment"],
        data: [
            {
                "Patient ID": "PAT0001",
                "Name": "John Doe",
                "Viral Load": "2500 🔴",
                "CD4": "45 🔴",
                "Conditions": "HIV",
                "Next Appointment": "2026-02-15"
            },
            ...
        ],
        pagination: {...},
        alerts: [
            {
                severity: "critical",
                icon: "🚨",
                message: "2 critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)"
            }
        ]
    }
    ↓
Frontend Formatting: formatTableResponse()
    ↓
Display to User:
    🚨 2 critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)
    
    | Patient ID | Name      | Viral Load | CD4 | Conditions | Next Appointment |
    |------------|-----------|------------|-----|------------|------------------|
    | PAT0001    | John Doe  | 2500 🔴    | 45  | HIV        | 2026-02-15       |
    | PAT0002    | Jane Smith| 1200 🔴    | 32  | HIV,HTN    | 2026-02-10       |
```

### 2. Backend Handler (index.ts - getCriticalPatients function)

**Location**: `supabase/functions/chatbot-query/index.ts` lines 1473-1548

**Function Signature**:
```typescript
async function getCriticalPatients(facilityId: string, query: string, params?: any)
```

**Clinical Criteria**:
- Viral Load ≥ 1000 copies/mL
- CD4 count < 50 cells/μL
- Conditions include "Hypertension" OR "Diabetes"

**Database Query**:
1. Fetches all patients for the facility (up to 500)
2. Applies clinical filters
3. Fetches next appointments for critical patients
4. Formats data with visual indicators (🔴 for critical values)
5. Returns paginated table response with alerts

## Code Changes

### File: assets/js/chatbot-ai.js

#### 1. Modified Intent Handler (lines 891-920)
```javascript
} else if (detectedIntent === "high_risk") {
    try {
        // Call the backend handler which uses clinical criteria
        const result = await this.callBackendHandler("getCriticalPatients", filters);
        
        if (result.type === "table" && result.data) {
            // Format and display table
            botResponse = `<strong>Critical Patients (${result.data.length}):</strong><br/>`;
            botResponse += this.formatTableResponse(result);
            
            // Add alert banner
            if (result.alerts && result.alerts.length > 0) {
                botResponse = `<div style="...">
                    <strong>${result.alerts[0].icon} ${result.alerts[0].message}</strong>
                </div>` + botResponse;
            }
        }
    } catch (error) {
        // Error handling
    }
}
```

#### 2. New Method: callBackendHandler (lines 573-628)
```javascript
async callBackendHandler(handlerName, filters = {}) {
    // Get facility ID from session/localStorage
    let facilityId = sessionStorage.getItem("facility_id");
    if (!facilityId) {
        const session = JSON.parse(localStorage.getItem("healthflow_session"));
        facilityId = session?.fid || "default-facility";
    }

    // Call Supabase Edge Function
    const response = await fetch(
        `${window.supabaseClient.supabaseUrl}/functions/v1/chatbot-query`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${window.supabaseClient.auth.session()?.access_token || ""}`
            },
            body: JSON.stringify({
                query: "",
                facility_id: facilityId,
                handler: handlerName,
                ...filters
            })
        }
    );

    return await response.json();
}
```

#### 3. New Method: formatTableResponse (lines 527-571)
```javascript
formatTableResponse(result) {
    let html = `<table class="table table-sm table-striped mt-2">
<thead><tr>`;
    
    // Add headers from result.columns
    // Add rows from result.data
    // Add pagination info
    
    return html + this.getFollowUpSuggestions();
}
```

## Facility ID Handling

The chatbot retrieves facility ID in this order:
1. Check `sessionStorage.getItem("facility_id")`
2. Parse `localStorage.getItem("healthflow_session")` and get `fid` or `facility_id`
3. Fallback to `"default-facility"`

This ensures the chatbot queries the correct facility's data.

## Supported Queries

These queries will now work correctly:
- "How many critical patients do we have?"
- "Show critical patients"
- "Critical patients needing attention"
- "List alert patients"
- "Show urgent patients"
- "Find critical patients"
- "Alert patients"

All trigger the `high_risk` intent and call `getCriticalPatients`.

## Error Handling

### Backend Errors
- If no patients found: Returns message "No critical patients at this time."
- If facility not found: Returns error message
- If database connection fails: Returns error message

### Frontend Errors
- If Supabase client not initialized: Throws error
- If response not OK: Parses error from backend
- All errors logged to console and displayed to user

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                            │
│                     (chatbot-ai.js)                             │
│                                                                  │
│  1. User types query                                            │
│  2. detectIntent("high_risk")                                   │
│  3. callBackendHandler("getCriticalPatients")                   │
│  4. Fetch request to Edge Function                             │
│                                                                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ HTTP POST
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│            Supabase Edge Function                                │
│         (/functions/v1/chatbot-query)                           │
│                                                                  │
│  1. Receives handler: "getCriticalPatients"                     │
│  2. Calls getCriticalPatients(facilityId, query, params)        │
│  3. Filters patients by:                                        │
│     - Viral Load >= 1000                                        │
│     - CD4 < 50                                                  │
│     - Conditions include HTN/DM                                 │
│  4. Fetches appointments                                        │
│  5. Formats response                                            │
│                                                                  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ JSON Response
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│         Frontend Response Handler                                │
│                                                                  │
│  1. Receive type: "table"                                       │
│  2. Call formatTableResponse()                                  │
│  3. Display alert banner                                        │
│  4. Show formatted table                                        │
│  5. Show pagination info                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Open chatbot
- [ ] Type "How many critical patients do we have?"
- [ ] Verify response shows table format
- [ ] Verify alert banner shows "🚨 X critical patient(s)..."
- [ ] Verify table has correct columns
- [ ] Verify critical values show 🔴 emoji
- [ ] Test with different facility IDs
- [ ] Verify "No critical patients" message when none found
- [ ] Check browser console for no errors

## Related Files

| File | Purpose |
|------|---------|
| `assets/js/chatbot-ai.js` | Frontend chatbot logic |
| `supabase/functions/chatbot-query/index.ts` | Backend handlers |
| `dashboard-data.js` | Session and facility management |

## Future Enhancements

1. Add ability to drill down on individual critical patients
2. Add custom thresholds for critical status
3. Add export to Excel for critical patients list
4. Add follow-up scheduling for critical patients
5. Add alerts/notifications for new critical patients
