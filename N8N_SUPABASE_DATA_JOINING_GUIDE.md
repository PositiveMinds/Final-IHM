# N8N + Supabase: Joining Tables and Pulling Data - Complete Guide

## Overview
This guide explains how to join tables and pull data from Supabase using n8n workflows. You'll learn multiple approaches from simple to advanced.

## Prerequisites

✅ **Supabase Account**
- Database set up with tables
- Tables with proper relationships (foreign keys)
- Supabase API credentials

✅ **N8N Setup**
- N8N instance running (self-hosted or cloud)
- Access to n8n editor

✅ **Database Schema Example**
```sql
-- Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255)
);

-- Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id),
  appointment_date TIMESTAMP,
  status VARCHAR(50)
);
```

## Method 1: Using PostgreSQL Node with SQL JOIN

### Step 1: Add PostgreSQL Node to Workflow

1. Click **"Add Node"** in n8n
2. Search for **"PostgreSQL"**
3. Select **"PostgreSQL"** node

### Step 2: Configure PostgreSQL Connection

```
Host: your-project.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [Your Supabase password]
SSL: true (required for Supabase)
```

### Step 3: Write SQL JOIN Query

```sql
SELECT 
  p.id,
  p.name,
  p.email,
  p.phone,
  a.id AS appointment_id,
  a.appointment_date,
  a.status
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.id = {{ $input.first().patient_id }}
ORDER BY a.appointment_date DESC;
```

### Query Examples

**Inner Join (Only patients with appointments):**
```sql
SELECT p.*, a.*
FROM patients p
INNER JOIN appointments a ON p.id = a.patient_id;
```

**Left Join (All patients, with appointments if available):**
```sql
SELECT p.*, a.*
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id;
```

**Multiple Joins:**
```sql
SELECT 
  p.name,
  a.appointment_date,
  d.name as doctor_name,
  r.result as lab_result
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN lab_results r ON a.id = r.appointment_id;
```

**Group By and Count:**
```sql
SELECT 
  p.name,
  COUNT(a.id) as total_appointments,
  MAX(a.appointment_date) as last_appointment
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name;
```

## Method 2: Using Supabase REST API

### Step 1: Add HTTP Request Node

1. Click **"Add Node"**
2. Search for **"HTTP Request"**
3. Select **"HTTP Request"** node

### Step 2: Configure Request

**Method:** GET

**URL:**
```
https://your-project.supabase.co/rest/v1/patients?select=*,appointments(*)
```

**Headers:**
```
apikey: [Your Supabase anon key]
Authorization: Bearer [Your Supabase anon key]
Content-Type: application/json
```

### Example URLs for Different Queries

**Simple SELECT:**
```
https://your-project.supabase.co/rest/v1/patients?select=id,name,email
```

**With Relationship (PostgREST):**
```
https://your-project.supabase.co/rest/v1/patients?select=*,appointments(*)
```

**Nested Relationships:**
```
https://your-project.supabase.co/rest/v1/patients?select=*,appointments(*,doctors(*))
```

**With Filters:**
```
https://your-project.supabase.co/rest/v1/appointments?select=*,patients(*)&status=eq.completed&order_by=appointment_date.desc
```

**With Limit:**
```
https://your-project.supabase.co/rest/v1/patients?select=*,appointments(*)&limit=10
```

### Header Configuration in N8N

```json
{
  "apikey": "your_supabase_anon_key",
  "Authorization": "Bearer your_supabase_anon_key",
  "Content-Type": "application/json"
}
```

## Method 3: Using Supabase Node (Recommended)

### Step 1: Install Supabase Community Node

If not available, install via:
```
npm install n8n-nodes-base-supabase
```

### Step 2: Add Supabase Node

1. Click **"Add Node"**
2. Search for **"Supabase"**
3. Select **"Supabase"** node

### Step 3: Create Connection

```
URL: https://your-project.supabase.co
API Key: [Your Supabase anon key]
```

### Step 4: Configure Query

**Operation:** Select rows
**Table:** patients
**Filters:** (optional)
**Limit:** 100
**Order By:** id (desc)

### After Getting Data, Add "Function" Node

Use Function node to join related data:

```javascript
// Fetch related appointments for each patient
const results = $input.all();
const output = [];

for (const patient of results) {
  // Construct appointment query URL
  const appointmentUrl = `https://your-project.supabase.co/rest/v1/appointments?patient_id=eq.${patient.id}`;
  
  output.push({
    ...patient,
    appointments: await fetch(appointmentUrl, {
      headers: {
        'apikey': 'your_supabase_anon_key'
      }
    }).then(r => r.json())
  });
}

return output;
```

## Method 4: Complex Joins with Code Node

### Complete Workflow for Joined Data

```javascript
// N8N Code Node - Join patients with appointments and doctors
const patients = $input.all();
const results = [];

for (const patient of patients) {
  // Get patient's appointments
  const appointmentsResponse = await fetch(
    `https://your-project.supabase.co/rest/v1/appointments?patient_id=eq.${patient.id}&select=*,doctors(*)`,
    {
      headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
      }
    }
  );
  
  const appointments = await appointmentsResponse.json();
  
  results.push({
    patient: {
      id: patient.id,
      name: patient.name,
      email: patient.email
    },
    appointments: appointments.map(apt => ({
      id: apt.id,
      date: apt.appointment_date,
      doctor: apt.doctors.name,
      status: apt.status
    }))
  });
}

return results;
```

## N8N Workflow Structure

### Simple Flow:
```
[Start] 
  → [HTTP Request to Supabase] 
  → [Process Data] 
  → [Save Results]
```

### Advanced Flow:
```
[Start] 
  → [PostgreSQL Query (JOIN)] 
  → [Function to Transform Data] 
  → [Loop Through Results] 
    → [Fetch Related Data]
  → [Merge Data] 
  → [Send to Webhook/Save]
```

## Best Practices

### 1. **Use PostgreSQL for Complex Joins**
- Better performance
- Complex SQL logic easier
- Multiple table joins

```sql
SELECT 
  p.id, p.name,
  COUNT(a.id) as appointment_count,
  STRING_AGG(a.status, ', ') as statuses
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.name;
```

### 2. **Use REST API for Simple Queries**
- Faster setup
- No database access needed
- Use relationships for joins

```
/rest/v1/table1?select=*,table2(*)
```

### 3. **Handle Large Datasets with Pagination**

```sql
SELECT p.*, a.*
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
OFFSET {{ $input.first().offset || 0 }} 
LIMIT 50;
```

### 4. **Error Handling**

```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(response.statusText);
  return await response.json();
} catch (error) {
  return { error: error.message };
}
```

### 5. **Cache Results for Performance**

Use n8n's built-in caching:
```
Store query results in workflow data
Reuse for subsequent operations
Reduce API calls
```

## Common Issues & Solutions

### Issue 1: "Invalid Foreign Key"
**Solution:** Ensure foreign keys exist in database
```sql
ALTER TABLE appointments 
ADD CONSTRAINT fk_patient 
FOREIGN KEY (patient_id) REFERENCES patients(id);
```

### Issue 2: "No rows returned"
**Solution:** Check WHERE clause and JOIN logic
```sql
-- Verify with SELECT first
SELECT * FROM patients WHERE id = 1;

-- Then build join
SELECT p.*, a.*
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.id = 1;
```

### Issue 3: "Slow Query Performance"
**Solution:** Add indexes to foreign keys
```sql
CREATE INDEX idx_appointments_patient_id 
ON appointments(patient_id);
```

### Issue 4: "401 Unauthorized on REST API"
**Solution:** Verify API key in headers
```
✓ Use anon key (for read/public data)
✓ Use service role key (for admin operations)
✓ Check API key is correct
```

## Environment Variables Setup

Create in N8N:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_PASSWORD=your_database_password
```

Then use in workflows:
```javascript
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
```

## Complete Workflow Example

### Scenario: Get patient with all appointments and doctors

**Step 1: PostgreSQL Node**
```sql
SELECT 
  p.id as patient_id,
  p.name as patient_name,
  p.email,
  a.id as appointment_id,
  a.appointment_date,
  d.name as doctor_name,
  d.specialty
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN doctors d ON a.doctor_id = d.id
WHERE p.id = {{ $input.first().patientId }}
ORDER BY a.appointment_date DESC;
```

**Step 2: Function Node - Transform Data**
```javascript
const rows = $input.all();
const patient = {
  id: rows[0].patient_id,
  name: rows[0].patient_name,
  email: rows[0].email,
  appointments: []
};

const appointmentIds = new Set();
rows.forEach(row => {
  if (row.appointment_id && !appointmentIds.has(row.appointment_id)) {
    appointmentIds.add(row.appointment_id);
    patient.appointments.push({
      id: row.appointment_id,
      date: row.appointment_date,
      doctor: {
        name: row.doctor_name,
        specialty: row.specialty
      }
    });
  }
});

return [patient];
```

**Step 3: HTTP Request - Send to Webhook/API**
```
Method: POST
URL: https://your-api.com/patients/update
Body: {{ $json }}
```

## Security Best Practices

✅ **Never expose API keys in workflows**
- Use environment variables
- Use credentials management
- Rotate keys regularly

✅ **Use Row Level Security (RLS)**
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);
```

✅ **Restrict REST API Access**
- Use anon key for read-only
- Use service role key for admin only
- Implement proper authentication

## Debugging Tips

### 1. **Test Queries in Supabase Console First**
- Go to Supabase dashboard
- SQL editor section
- Test your JOIN query
- Then use in n8n

### 2. **Log Intermediate Results**
```javascript
console.log('Patient data:', patientData);
console.log('Appointments:', appointments);
```

### 3. **Use HTTP Node Debug**
- Enable "Debug" mode
- Check request/response
- Verify headers and data

### 4. **Test with Sample Data**
- Create test tables
- Populate with sample data
- Test workflows before production

## Summary

### Quick Decision Tree:
```
Need complex SQL joins?
  ├─ YES → Use PostgreSQL Node
  └─ NO → Use REST API or Supabase Node

Have large dataset?
  ├─ YES → Add pagination & indexes
  └─ NO → Simple query is fine

Need real-time updates?
  ├─ YES → Use webhooks + triggers
  └─ NO → Scheduled workflow is fine
```

### Key Takeaways:
1. **PostgreSQL Node** - Best for complex joins
2. **REST API** - Best for simplicity
3. **Supabase Node** - Best for all-in-one (if available)
4. **Always test** - Test queries in Supabase first
5. **Use indexes** - For large tables, add indexes
6. **Secure keys** - Use environment variables
7. **Handle errors** - Add try/catch blocks

This guide covers all methods to join tables and pull data from Supabase using n8n!
