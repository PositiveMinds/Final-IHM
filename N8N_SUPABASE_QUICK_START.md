# N8N + Supabase Quick Start - 5 Minutes

## The Fastest Way to Join Tables & Pull Data

### Option A: PostgreSQL Node (Recommended - Most Powerful)

#### 1. Create New Workflow in N8N
- Click "New Workflow"
- Name it "Supabase Data Join"

#### 2. Add PostgreSQL Node
```
Node Type: PostgreSQL
```

#### 3. Add Credentials
```
Host: your-project.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [from Supabase dashboard → Settings → Database → Password]
SSL: ✓ Enable
```

#### 4. Write Your Join Query
Replace with your actual table names:

```sql
SELECT 
  p.id,
  p.name,
  p.email,
  a.id as appointment_id,
  a.appointment_date,
  a.status
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
ORDER BY a.appointment_date DESC;
```

#### 5. Execute & Done! 
Output will be in `$json`

---

### Option B: REST API (Simplest)

#### 1. Add HTTP Request Node
```
Method: GET
```

#### 2. URL (with JOIN):
```
https://your-project.supabase.co/rest/v1/patients?select=*,appointments(*)
```

#### 3. Headers:
```json
{
  "apikey": "YOUR_SUPABASE_ANON_KEY",
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
}
```

#### 4. Done!
Relationships auto-included with `appointments(*)`

---

## Get Your Supabase Credentials

### From Supabase Dashboard:

1. **Go to:** Project Settings → API
2. **Copy:**
   - `URL` → your-project.supabase.co
   - `anon key` → Use in REST API
   - `service_role key` → Use for admin operations

3. **Go to:** Settings → Database
   - **Copy:** Your database password (for PostgreSQL connection)

---

## Common Queries

### Get Patient + All Appointments
```sql
SELECT p.*, a.*
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.id = 123;
```

### Get Patient + Doctor + Test Results
```sql
SELECT 
  p.name as patient,
  d.name as doctor,
  a.appointment_date,
  tr.result
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN test_results tr ON a.id = tr.appointment_id;
```

### Count Appointments Per Patient
```sql
SELECT 
  p.name,
  COUNT(a.id) as total_appointments
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name;
```

---

## What Each Method Is Best For

| Method | Speed | Complexity | Best For |
|--------|-------|-----------|----------|
| **PostgreSQL** | ⚡ Fast | ⭐⭐⭐ Complex | Complex joins, aggregations |
| **REST API** | ⚡⚡ Medium | ⭐ Simple | Quick queries, relationships |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check SSL is enabled, host is correct |
| "401 Unauthorized" | Check API key is correct |
| "No rows returned" | Check WHERE clause, table names |
| "Column not found" | Check column name spelling |

---

## Next Steps

1. ✅ Set up credentials
2. ✅ Test with simple SELECT
3. ✅ Add JOIN clause
4. ✅ Add WHERE/ORDER BY
5. ✅ Save and execute
6. ✅ Use output data in workflow

---

## Use Data in Next Steps

After getting data from Supabase:

### Process with Function Node:
```javascript
const patients = $input.all();
return patients.filter(p => p.total_appointments > 5);
```

### Send to API:
```
POST https://your-api.com/data
Body: {{ $json }}
```

### Save to Another Database:
```
PostgreSQL/MySQL insert node
```

### Send Email:
```
Email node with appointment data
```

---

## Example Workflow Flow

```
┌─────────────────────┐
│  PostgreSQL Node    │ ← Query joins tables
│ (SELECT...JOIN...)  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Function Node      │ ← Transform data
│ (Process/Filter)    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  HTTP Request       │ ← Send to API
│ (or Email/Save)     │
└─────────────────────┘
```

---

## Real Healthcare Example

Get patients with missed appointments:

```sql
SELECT 
  p.id,
  p.name,
  p.phone,
  a.appointment_date,
  CURRENT_DATE - a.appointment_date::date as days_since_missed
FROM patients p
INNER JOIN appointments a ON p.id = a.patient_id
WHERE a.status = 'missed'
AND a.appointment_date < CURRENT_DATE
ORDER BY a.appointment_date DESC
LIMIT 10;
```

Then use n8n to send SMS reminders to these patients!

---

## Pro Tips

💡 **Tip 1:** Test your SQL in Supabase SQL editor first
💡 **Tip 2:** Use `LIMIT 10` while testing
💡 **Tip 3:** Add indexes to foreign key columns for speed
💡 **Tip 4:** Use REST API for read-only, PostgreSQL for complex logic
💡 **Tip 5:** Save credentials for reuse across workflows

---

## Still Need Help?

Check: `N8N_SUPABASE_DATA_JOINING_GUIDE.md` for detailed guide with all methods!
