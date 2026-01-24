# Critical Patients Chatbot Query - Quick Reference

## What Was Fixed
Chatbot now correctly identifies critical patients using **clinical criteria** instead of database status field.

## Clinical Criteria for "Critical Patients"
A patient is considered critical if they have:
- **Viral Load ≥ 1000 copies/mL** OR
- **CD4 count < 50 cells/μL** OR  
- **Conditions: Hypertension or Diabetes**

## How to Test

### Test Query
```
User: "How many critical patients do we have?"
```

### Expected Response Format
```
🚨 X critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)

| Patient ID | Name    | Viral Load | CD4 | Conditions | Next Appointment |
|------------|---------|------------|-----|------------|------------------|
| PAT0001    | Name    | 2500 🔴    | 32  | HIV        | Date             |
```

## Technical Flow

1. **User Query** → "How many critical patients..."
2. **Intent** → Detected as `high_risk`
3. **Handler** → `callBackendHandler("getCriticalPatients")`
4. **Backend** → Filters patients by clinical criteria
5. **Response** → Table with alerts

## Key Components

### Frontend (assets/js/chatbot-ai.js)
- **Intent**: `high_risk` (patterns: critical, alert, urgent)
- **Method**: `callBackendHandler("getCriticalPatients")`
- **Display**: `formatTableResponse(result)`

### Backend (supabase/functions/chatbot-query/index.ts)
- **Handler**: `getCriticalPatients` (line 1476)
- **Filters**: VL >= 1000, CD4 < 50, conditions include HTN/DM
- **Returns**: Table with type="table", data, columns, alerts

## Troubleshooting

### "No critical patients" when there should be some
**Check**:
1. Verify `last_viral_load` and `last_cd4_count` columns exist in patients table
2. Verify data has values >= 1000 for viral load or < 50 for CD4
3. Check facility_id is correctly passed (from session)
4. Check browser console for errors

### Table not displaying
**Check**:
1. Backend returned `type: "table"` and `data` array
2. `formatTableResponse()` is being called
3. Column headers match result.columns
4. Browser console for JavaScript errors

### Facility ID not found
**Check**:
1. User is logged in and has session
2. `localStorage.getItem("healthflow_session")` returns valid JSON
3. Session has `fid` or `facility_id` property

## Debug Commands (Browser Console)

```javascript
// Check session
JSON.parse(localStorage.getItem("healthflow_session"))

// Check facility ID
sessionStorage.getItem("facility_id")

// Check if chatbot is loaded
window.healthFlowChatbot

// Check Supabase client
window.supabaseClient

// Test backend call manually
await healthFlowChatbot.callBackendHandler("getCriticalPatients", {})
```

## Database Query Reference

The backend executes this logic:

```sql
-- Fetch all patients
SELECT pid, patient_name, hiv_status, last_viral_load, last_cd4_count, conditions
FROM patients
WHERE fid = '<facility_id>'
LIMIT 500

-- Filter for critical:
WHERE last_viral_load >= 1000
   OR last_cd4_count < 50
   OR conditions LIKE '%hypertension%'
   OR conditions LIKE '%diabetes%'
```

## Response Example

```json
{
  "type": "table",
  "columns": ["Patient ID", "Name", "Viral Load", "CD4", "Conditions", "Next Appointment"],
  "data": [
    {
      "Patient ID": "PAT0001",
      "Name": "John Doe",
      "Viral Load": "2500 🔴",
      "CD4": "45 🔴",
      "Conditions": "HIV",
      "Next Appointment": "2026-02-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2
  },
  "alerts": [
    {
      "severity": "critical",
      "icon": "🚨",
      "message": "2 critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)"
    }
  ]
}
```

## Related Queries
These also trigger critical patients handler:
- "Show critical patients"
- "List alert patients"  
- "Critical patients needing attention"
- "Show urgent patients"
- "Find patients at risk"

## Files Modified
- `assets/js/chatbot-ai.js` - Added methods and updated intent handler

## Files NOT Modified
- Backend handlers (already implemented correctly in Supabase Edge Function)
- Database schema
- Patient data

## Integration Points

| Component | Integration |
|-----------|-----------|
| Intent Detection | `high_risk` intent triggers handler |
| Facility ID | From session via `localStorage.getItem("healthflow_session")` |
| Backend Call | POST to `/functions/v1/chatbot-query` |
| Response Formatting | `formatTableResponse()` method |
| Display | HTML table with Bootstrap styling |
