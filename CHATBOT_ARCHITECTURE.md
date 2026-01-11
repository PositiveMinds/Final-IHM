# Chatbot Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FACILITY STAFF                             │
│                      (Dashboard User)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Click "AI" button
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (GitHub Pages)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             chatbot-handler.js                           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ • Floating button (bottom-right, green)                  │   │
│  │ • Chat modal with slide-in animation                     │   │
│  │ • Message input & send button                            │   │
│  │ • Format responses (text or table)                       │   │
│  │ • Get facility_id from localStorage                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             │ fetch() to Edge Function            │
│                             │ {                                   │
│                             │   query: "appointments next week"   │
│                             │   facility_id: 1                    │
│                             │ }                                   │
└─────────────────────────────┼─────────────────────────────────────┘
                              │ HTTPS (Secure)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE EDGE FUNCTIONS                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         supabase-edge-function.js (Backend)              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ PATTERN MATCHING:                                        │   │
│  │  • "appointments next week" → getAppointmentsNextWeek()  │   │
│  │  • "patients on art" → getARTPatients()                  │   │
│  │  • "high viral" → getHighViralLoadPatients()             │   │
│  │  • "new patients" → getNewPatients()                     │   │
│  │  • [10+ more patterns]                                   │   │
│  │                                                           │   │
│  │ VALIDATION:                                              │   │
│  │  ✓ Query not empty                                       │   │
│  │  ✓ facility_id provided                                  │   │
│  │  ✓ Pattern match found                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             │ Query DB with facility_id filter    │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         SUPABASE POSTGRESQL + RLS POLICIES              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ SELECT * FROM patients                                   │   │
│  │ WHERE fid = $facility_id  ← RLS enforced                 │   │
│  │                                                           │   │
│  │ Tables:                                                  │   │
│  │  • patients (pid, patient_name, fid, appointment_date...) │   │
│  │  • facilities (facility_id, facility_name)               │   │
│  │                                                           │   │
│  │ RLS Policy Example:                                      │   │
│  │  SELECT: facility_id = auth.uid()                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             │ Return filtered data                │
│                             ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         RESPONSE FORMATTER (Edge Function)              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ If type = 'table':                                       │   │
│  │ {                                                        │   │
│  │   type: 'table',                                         │   │
│  │   columns: ['Patient ID', 'Name', 'Date'],              │   │
│  │   data: [                                                │   │
│  │     { 'Patient ID': '001', 'Name': 'John', ... },       │   │
│  │     { 'Patient ID': '002', 'Name': 'Jane', ... }        │   │
│  │   ]                                                      │   │
│  │ }                                                        │   │
│  │                                                           │   │
│  │ If type = 'text':                                        │   │
│  │ {                                                        │   │
│  │   type: 'text',                                          │   │
│  │   message: "No data found..."                            │   │
│  │ }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬─────────────────────────────────────┘
                              │ JSON Response (HTTPS)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (GitHub Pages)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Response Handler (chatbot-handler.js)            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ type = 'table'? → Create HTML table                      │   │
│  │ type = 'text'?  → Create message bubble                  │   │
│  │                                                           │   │
│  │ Add to chat messages                                     │   │
│  │ Auto-scroll to latest message                            │   │
│  │ Hide loading spinner                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                     │
│                             │ Display to user                     │
│                             ↓                                     │
│              ╔════════════════════════════════╗                  │
│              ║ Facility Assistant             ║                  │
│              ╟────────────────────────────────╢                  │
│              ║ Bot: Here are appointments:    ║                  │
│              ║                                ║                  │
│              ║ ┌──────────┬──────┬────────┐  ║                  │
│              ║ │ Patient  │ Name │ Date   │  ║                  │
│              ║ ├──────────┼──────┼────────┤  ║                  │
│              ║ │ 001      │ John │ Jan 20│  ║                  │
│              ║ │ 002      │ Jane │ Jan 21│  ║                  │
│              ║ └──────────┴──────┴────────┘  ║                  │
│              ║                                ║                  │
│              ║ Ask something else...          ║                  │
│              ║                                ║                  │
│              ║ [                      ] [→]   ║                  │
│              ╚════════════════════════════════╝                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (chatbot-handler.js)
- **UI Rendering**: Floating button, modal, messages
- **User Input**: Capture and send queries
- **Response Formatting**: Convert JSON to HTML tables/messages
- **State Management**: Open/close modal, track session
- **Local Storage**: Get facility_id from session

### Backend (supabase-edge-function.js)
- **Pattern Matching**: Parse query, find handler function
- **Data Queries**: Execute SQL with facility_id filter
- **Response Formatting**: Structure data for frontend
- **Security**: Validate inputs, enforce RLS
- **Error Handling**: Return meaningful error messages

### Database (Supabase PostgreSQL)
- **Data Storage**: patients, facilities, appointments
- **RLS Policies**: Enforce facility-level access control
- **Query Execution**: Return filtered results

## Security Model

```
┌─────────────────────────────────────────┐
│  Query arrives at Edge Function         │
└─────────────────┬───────────────────────┘
                  │
                  ↓
        ┌─────────────────────┐
        │ Validate facility_id │
        └─────────────┬───────┘
                      │
                      ↓
        ┌──────────────────────────┐
        │ Find matching pattern     │
        │ (server-side logic)       │
        └─────────────┬────────────┘
                      │
                      ↓
        ┌──────────────────────────────┐
        │ Query: SELECT * FROM patients │
        │ WHERE fid = $facility_id      │
        └─────────────┬────────────────┘
                      │
                      ↓
        ┌────────────────────────────┐
        │ RLS Policy Check:           │
        │ facility_id = user's fid    │
        │ (database-level security)   │
        └─────────────┬──────────────┘
                      │
                      ↓
        ┌────────────────────────────┐
        │ Return results to frontend  │
        │ (facility data only)        │
        └────────────────────────────┘
```

## Data Flow Example

### Query: "Show appointments next week"

```
1. FRONTEND
   User types: "Show appointments next week"
   ↓
   chatbot-handler.js captures input
   ↓
   Sends: {
     query: "Show appointments next week",
     facility_id: 1
   }

2. EDGE FUNCTION
   ↓
   findMatchingPattern("show appointments next week")
   ↓
   Matches: QUERY_PATTERNS['appointments_next_week']
   ↓
   Executes: getAppointmentsNextWeek(facilityId=1, query)
   ↓
   const today = new Date()
   const nextWeek = new Date(today + 7 days)
   
   SELECT pid, patient_name, appointment_date, status
   FROM patients
   WHERE fid = 1
   AND appointment_date BETWEEN today AND nextWeek
   
   ↓
   Results: [
     { pid: '001', patient_name: 'John', appointment_date: '2026-01-20', status: 'Active' },
     { pid: '002', patient_name: 'Jane', appointment_date: '2026-01-21', status: 'Active' }
   ]

3. RESPONSE FORMATTER
   ↓
   {
     type: 'table',
     columns: ['Patient ID', 'Name', 'Appointment Date', 'Status'],
     data: [
       { 'Patient ID': '001', 'Name': 'John', 'Appointment Date': 'Jan 20, 2026', 'Status': 'Active' },
       { 'Patient ID': '002', 'Name': 'Jane', 'Appointment Date': 'Jan 21, 2026', 'Status': 'Active' }
     ]
   }

4. FRONTEND RENDERS
   ↓
   <div class="chatbot-table-wrapper">
     <table>
       <thead>
         <tr><th>Patient ID</th><th>Name</th><th>Appointment Date</th><th>Status</th></tr>
       </thead>
       <tbody>
         <tr><td>001</td><td>John</td><td>Jan 20, 2026</td><td>Active</td></tr>
         <tr><td>002</td><td>Jane</td><td>Jan 21, 2026</td><td>Active</td></tr>
       </tbody>
     </table>
   </div>
```

## Performance Optimization

| Aspect | Approach |
|--------|----------|
| Speed | Pattern matching (no NLP/AI) → direct SQL query |
| Security | RLS at database level → no extra filtering needed |
| Reliability | Try-catch in Edge Function → graceful errors |
| Scalability | Supabase handles horizontal scaling |
| Cost | Pattern-based (no AI API costs) |

## Deployment Checklist

- [ ] Deploy Edge Function to Supabase
- [ ] Test Edge Function in Supabase dashboard
- [ ] Verify chatbot button appears in dashboard
- [ ] Test 5 queries: appointments, ART, viral load, new patients, status
- [ ] Verify results show only current facility data
- [ ] Test on mobile device
- [ ] Train facility staff on available queries

---

**Status**: Ready for production  
**Last Updated**: 2026-01-12  
**Tech Stack**: Vanilla JS + Supabase Edge Functions + PostgreSQL
