# Critical Patients Query Fix

## Problem
The chatbot query "How many critical patients do we have?" was returning nothing even though there were critical patients in the system (those with high viral load >= 1000 copies/mL, CD4 < 50, or conditions like Hypertension/Diabetes).

## Root Cause
The chatbot was using **client-side filtering** instead of calling the **backend handler**:

1. When user asked "How many critical patients?", it triggered the `high_risk` intent
2. The intent then called `queryPatients({ status: "Critical" })`
3. This queried the `patients` table directly looking for records with `status = "Critical"`
4. But the patients table may not have this status field properly set, resulting in no results

Meanwhile, the backend Supabase Edge Function had a sophisticated `getCriticalPatients` handler that identifies critical patients using clinical criteria:
- Viral Load >= 1000 copies/mL
- CD4 count < 50
- Conditions include Hypertension or Diabetes

## Solution
Modified `assets/js/chatbot-ai.js` to:

1. **Call the backend handler** instead of querying locally:
   - Changed from: `queryPatients({ status: "Critical" })`
   - Changed to: `callBackendHandler("getCriticalPatients", filters)`

2. **Added two new methods**:
   - `callBackendHandler()` - Invokes the Supabase Edge Function
   - `formatTableResponse()` - Formats backend table responses

3. **Handler invocation flow**:
   ```
   User: "How many critical patients do we have?"
   ↓
   Intent: high_risk (detected)
   ↓
   callBackendHandler("getCriticalPatients")
   ↓
   Backend: Query patients by VL >= 1000, CD4 < 50, or HTN/DM
   ↓
   Response: Table with critical patients + alert icon
   ```

## What Changed
File: `assets/js/chatbot-ai.js`

### Before (lines 891-916)
```javascript
} else if (detectedIntent === "high_risk") {
    try {
        const patients = await this.queryPatients({
            status: "Critical",
            ...filters,
        });
        this.lastQueryResults = patients;
        if (patients.length > 0) {
            botResponse = `<strong>High-Risk Patients (${patients.length}):</strong><br/>`;
            botResponse += this.formatPatientResponse(patients);
        } else {
            botResponse = "No critical patients at this time.";
        }
    }
}
```

### After
```javascript
} else if (detectedIntent === "high_risk") {
    try {
        const result = await this.callBackendHandler("getCriticalPatients", filters);
        
        if (result.type === "table" && result.data) {
            this.lastQueryResults = result.data;
            botResponse = `<strong>Critical Patients (${result.data.length}):</strong><br/>`;
            botResponse += this.formatTableResponse(result);
            
            // Add alert if present
            if (result.alerts && result.alerts.length > 0) {
                botResponse = `<div style="background: #ffe5e5; border-left: 4px solid #d32f2f; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
                    <strong style="color: #d32f2f;">${result.alerts[0].icon} ${result.alerts[0].message}</strong>
                </div>` + botResponse;
            }
        } else {
            botResponse = result.message || "No critical patients at this time.";
            this.lastQueryResults = [];
        }
    }
}
```

## Backend Handler Reference
Location: `supabase/functions/chatbot-query/index.ts` (lines 1473-1548)

**Handler Name**: `getCriticalPatients`

**Clinical Criteria**:
- Viral Load >= 1000 copies/mL
- CD4 count < 50
- Conditions contain "hypertension" or "diabetes"

**Returns**:
- Type: `table`
- Columns: Patient ID, Name, Viral Load, CD4, Conditions, Next Appointment
- Alerts: Critical severity with message about patients requiring immediate attention

## Testing
To test this fix:

1. Open the chatbot
2. Type: "How many critical patients do we have?"
3. Expected: Show a table with critical patients and a red alert badge

## Additional Related Queries
The fix also enables these queries to work properly:
- "Show critical patients"
- "Critical patients needing attention"
- "List alert patients"
- "Urgent patients"

All will now call the intelligent backend handler instead of filtering locally.
