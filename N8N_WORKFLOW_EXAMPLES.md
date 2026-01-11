# N8N Workflow Examples - Ready to Use

## Example 1: Simple Patient + Appointments JOIN

### Use Case
Get all patients with their upcoming appointments

### Workflow JSON Configuration

**Node 1: PostgreSQL Query**
```json
{
  "name": "PostgreSQL",
  "type": "n8n-nodes-base.postgres",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "query": "SELECT p.id, p.name, p.email, p.phone, a.id as appointment_id, a.appointment_date, a.status FROM patients p LEFT JOIN appointments a ON p.id = a.patient_id WHERE a.appointment_date >= CURRENT_DATE ORDER BY a.appointment_date ASC",
    "limit": 100
  },
  "credentials": {
    "postgresqlPrivate": "supabase-connection"
  }
}
```

**Node 2: Format Output**
```json
{
  "name": "Function",
  "type": "n8n-nodes-base.function",
  "typeVersion": 1,
  "position": [450, 300],
  "parameters": {
    "functionCode": "const appointments = $input.all();\nconst grouped = {};\n\nappointments.forEach(apt => {\n  if (!grouped[apt.id]) {\n    grouped[apt.id] = {\n      patient_id: apt.id,\n      patient_name: apt.name,\n      email: apt.email,\n      phone: apt.phone,\n      appointments: []\n    };\n  }\n  if (apt.appointment_id) {\n    grouped[apt.id].appointments.push({\n      id: apt.appointment_id,\n      date: apt.appointment_date,\n      status: apt.status\n    });\n  }\n});\n\nreturn Object.values(grouped);"
  }
}
```

**Output Sample:**
```json
[
  {
    "patient_id": 1,
    "patient_name": "John Doe",
    "email": "john@example.com",
    "phone": "+256775582968",
    "appointments": [
      {
        "id": 101,
        "date": "2024-01-15",
        "status": "scheduled"
      },
      {
        "id": 102,
        "date": "2024-01-20",
        "status": "completed"
      }
    ]
  }
]
```

---

## Example 2: Multi-Table JOIN with Aggregation

### Use Case
Get patients, count appointments, and show last visit date

### SQL Query
```sql
SELECT 
  p.id,
  p.name,
  p.email,
  COUNT(a.id) as total_appointments,
  MAX(a.appointment_date) as last_visit,
  STRING_AGG(DISTINCT a.status, ', ') as appointment_statuses
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name, p.email
HAVING COUNT(a.id) > 0
ORDER BY last_visit DESC;
```

### Use in N8N
```json
{
  "name": "Get Patient Stats",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "query": "SELECT p.id, p.name, p.email, COUNT(a.id) as total_appointments, MAX(a.appointment_date) as last_visit FROM patients p LEFT JOIN appointments a ON p.id = a.patient_id GROUP BY p.id, p.name, p.email ORDER BY last_visit DESC"
  }
}
```

---

## Example 3: REST API with Relationships

### Use Case
Fetch patients with nested appointments and doctors using REST API

### HTTP Request Configuration
```json
{
  "name": "Fetch from REST API",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 1,
  "parameters": {
    "url": "https://your-project.supabase.co/rest/v1/patients?select=*,appointments(id,appointment_date,status,doctors(name,specialty))&limit=50",
    "method": "GET",
    "headers": {
      "apikey": "{{ $env.SUPABASE_ANON_KEY }}",
      "Authorization": "Bearer {{ $env.SUPABASE_ANON_KEY }}"
    }
  }
}
```

### URL Breakdown
```
https://your-project.supabase.co/rest/v1/patients
?select=*,appointments(id,appointment_date,status,doctors(name,specialty))
&limit=50
```

- `*` = all patient fields
- `appointments(...)` = nested relationship
- `doctors(...)` = nested relationship of appointments
- `limit=50` = max 50 rows

---

## Example 4: Send Missed Appointment Reminders

### Use Case
Find patients with missed appointments and send SMS/Email reminders

### Complete Workflow

**Step 1: Find Missed Appointments**
```sql
SELECT 
  p.id,
  p.name,
  p.phone,
  p.email,
  a.appointment_date,
  EXTRACT(DAY FROM CURRENT_DATE - a.appointment_date::date) as days_missed
FROM patients p
INNER JOIN appointments a ON p.id = a.patient_id
WHERE a.status = 'missed'
AND a.appointment_date < CURRENT_DATE
AND a.appointment_date > CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.appointment_date DESC;
```

**Step 2: Loop and Send SMS**
```json
{
  "name": "Send Reminders",
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 1,
    "loopOver": "$input.all()"
  }
}
```

**Step 3: Send via Twilio/SMS Node**
```json
{
  "name": "Send SMS",
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "phoneNumber": "{{ $json.phone }}",
    "message": "Hello {{ $json.name }}, you missed your appointment on {{ $json.appointment_date }}. Please reschedule: https://healthflow.ug/reschedule"
  }
}
```

**Step 4: Log in Database**
```sql
INSERT INTO reminder_logs (patient_id, sent_date, message_type)
VALUES ({{ $json.id }}, CURRENT_TIMESTAMP, 'missed_appointment_sms');
```

---

## Example 5: Daily Appointment Summary Report

### Use Case
Generate daily summary of all appointments

### Workflow Structure
```
[Trigger: Daily at 8 AM]
  ↓
[Query appointments for today]
  ↓
[Format as HTML table]
  ↓
[Send email report]
```

### Query
```sql
SELECT 
  a.id,
  p.name as patient_name,
  d.name as doctor_name,
  a.appointment_time,
  a.status,
  c.name as clinic_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN clinics c ON a.clinic_id = c.id
WHERE DATE(a.appointment_time) = CURRENT_DATE
ORDER BY a.appointment_time ASC;
```

### Format Output (Function Node)
```javascript
const appointments = $input.all();

const html = `
<h2>Daily Appointment Report - ${new Date().toLocaleDateString()}</h2>
<table border="1" cellpadding="10">
  <tr>
    <th>Patient</th>
    <th>Doctor</th>
    <th>Time</th>
    <th>Status</th>
    <th>Clinic</th>
  </tr>
  ${appointments.map(apt => `
    <tr>
      <td>${apt.patient_name}</td>
      <td>${apt.doctor_name}</td>
      <td>${apt.appointment_time}</td>
      <td>${apt.status}</td>
      <td>${apt.clinic_name}</td>
    </tr>
  `).join('')}
</table>
`;

return [{ html }];
```

---

## Example 6: Update Patient Records with Appointment Count

### Use Case
Update patient table with total appointment count

### Query
```sql
UPDATE patients p
SET total_appointments = (
  SELECT COUNT(*)
  FROM appointments a
  WHERE a.patient_id = p.id
)
WHERE p.id IN (
  SELECT DISTINCT patient_id FROM appointments
);
```

### Execute in N8N
```json
{
  "name": "Update Patient Stats",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "query": "UPDATE patients p SET total_appointments = (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id) WHERE p.id IN (SELECT DISTINCT patient_id FROM appointments)"
  }
}
```

---

## Example 7: Error Handling & Retry Logic

### Workflow with Error Handling
```json
{
  "name": "PostgreSQL with Error Handler",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "query": "SELECT * FROM patients WHERE id = {{ $input.first().id }}"
  },
  "onError": "continueErrorOutput"
}
```

**Catch Errors Node**
```json
{
  "name": "Handle Errors",
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "rules": [
        {
          "value1": "{{ $json.error }}",
          "operation": "exists"
        }
      ]
    }
  }
}
```

**True Branch: Log Error**
```json
{
  "name": "Log Error",
  "type": "n8n-nodes-base.http",
  "parameters": {
    "url": "https://your-api.com/errors",
    "method": "POST",
    "body": "{ \"error\": \"{{ $json.error }}\", \"timestamp\": \"{{ $now }}\" }"
  }
}
```

---

## Example 8: Paginated Query for Large Datasets

### Use Case
Handle large result sets with pagination

### Query with Pagination
```sql
SELECT p.*, a.*
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
ORDER BY p.id ASC
LIMIT {{ $input.first().limit || 50 }}
OFFSET {{ $input.first().offset || 0 }};
```

### N8N Loop Setup
```json
{
  "name": "Get All Records",
  "type": "n8n-nodes-base.function",
  "parameters": {
    "functionCode": "const limit = 50;\nconst offsets = [];\n\nfor (let i = 0; i < 1000; i += limit) {\n  offsets.push({ offset: i, limit: limit });\n}\n\nreturn offsets;"
  }
}
```

Then loop through offsets using "Repeat" or similar node.

---

## Setting Up Credentials

### PostgreSQL Credentials in N8N

```json
{
  "Host": "your-project.supabase.co",
  "Port": 5432,
  "Database": "postgres",
  "User": "postgres",
  "Password": "[Your DB Password from Supabase]",
  "SSL": true,
  "TLS": true
}
```

### REST API Credentials (Environment Variables)

Create in N8N Settings:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR...
```

Usage in workflows:
```
{{ $env.SUPABASE_URL }}
{{ $env.SUPABASE_ANON_KEY }}
```

---

## Testing Workflow Steps

### 1. Test Query Alone
- Add just PostgreSQL node
- Click "Execute Workflow"
- Check output in "Executions"

### 2. Add Function Node
- Add function to transform data
- Test intermediate output
- Verify data format

### 3. Add Final Action
- Send to API, email, webhook
- Test with sample data first
- Run full workflow

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Column doesn't exist" | Check table schema in Supabase |
| "Timeout" | Add LIMIT to query |
| "SSL error" | Ensure SSL is enabled in credentials |
| "401 Unauthorized" | Check API key is correct |
| "No data returned" | Verify WHERE conditions |

---

## Next: Try These Workflows!

1. ✅ Start with Example 1 (Simple JOIN)
2. ✅ Progress to Example 4 (Send Reminders)
3. ✅ Build Example 5 (Daily Report)
4. ✅ Add error handling from Example 7

Happy automating! 🚀
