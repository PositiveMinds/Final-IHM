# Data Import API Reference

## Functions

### parseCSV(text: string): Object[]

Parses a CSV string into an array of objects.

**Parameters:**
- `text` (string): CSV content as a string

**Returns:** Array of objects where each object represents a row with column names as keys

**Example:**
```javascript
const csv = "name,age\nJohn,30\nJane,25";
const data = parseCSV(csv);
// Result: [{ name: 'John', age: '30' }, { name: 'Jane', age: '25' }]
```

---

### importPatients(data: Object[]): Promise

Imports patient records to the database in batches.

**Parameters:**
- `data` (Object[]): Array of patient objects with required fields:
  - `first_name` (string, required)
  - `last_name` (string, required)
  - `email` (string, required)
  - `phone_number` (string, required)
  - `date_of_birth` (string, required, format: YYYY-MM-DD)
  - `gender` (string, required, values: M/F/O)
  - `national_id` (string, optional)

**Returns:** Promise (shows SweetAlert dialog with results)

**Example:**
```javascript
const patients = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone_number: '0701234567',
    date_of_birth: '1990-05-15',
    gender: 'M',
    national_id: 'CM12345678A'
  }
];

await importPatients(patients);
```

---

### importAppointments(data: Object[]): Promise

Imports appointment records to the database in batches.

**Parameters:**
- `data` (Object[]): Array of appointment objects with required fields:
  - `patient_id` (string/number, required)
  - `appointment_date` (string, required, format: YYYY-MM-DD)
  - `appointment_time` (string, required, format: HH:MM)
  - `reason` (string, required)
  - `doctor_name` (string, required)

**Returns:** Promise (shows SweetAlert dialog with results)

**Example:**
```javascript
const appointments = [
  {
    patient_id: 1,
    appointment_date: '2024-01-25',
    appointment_time: '09:00',
    reason: 'HIV Viral Load Test',
    doctor_name: 'Dr. Sarah Omondi'
  }
];

await importAppointments(appointments);
```

---

## Event Listeners

### Patient Import Button

**Element ID:** `patientImportBtn`
**Event:** click
**Handler:** Triggers CSV parsing and preview/import flow

**HTML:**
```html
<button id="patientImportBtn">Import Patients</button>
```

### Patient Import File Input

**Element ID:** `patientCSVFile`
**Type:** file input (accepts .csv)
**Validation:** Max 5MB, CSV format only

### Patient Preview Confirm Button

**Element ID:** `patientConfirmImportBtn`
**Event:** click
**Handler:** Confirms and executes patient import

### Patient Preview Cancel Button

**Element ID:** `patientCancelImportBtn`
**Event:** click
**Handler:** Cancels preview and resets form

---

### Appointment Import Button

**Element ID:** `appointmentImportBtn`
**Event:** click
**Handler:** Triggers CSV parsing and preview/import flow

### Appointment Import File Input

**Element ID:** `appointmentCSVFile`
**Type:** file input (accepts .csv)
**Validation:** Max 5MB, CSV format only

### Appointment Preview Confirm Button

**Element ID:** `appointmentConfirmImportBtn`
**Event:** click
**Handler:** Confirms and executes appointment import

### Appointment Preview Cancel Button

**Element ID:** `appointmentCancelImportBtn`
**Event:** click
**Handler:** Cancels preview and resets form

---

## Data Structures

### Patient Object

```javascript
{
  first_name: string,      // Required
  last_name: string,       // Required
  email: string,           // Required, valid email
  phone_number: string,    // Required
  date_of_birth: string,   // Required, YYYY-MM-DD
  gender: string,          // Required, M|F|O
  national_id: string      // Optional
}
```

### Appointment Object

```javascript
{
  patient_id: number|string,      // Required, must exist in patients table
  appointment_date: string,       // Required, YYYY-MM-DD
  appointment_time: string,       // Required, HH:MM
  reason: string,                 // Required
  doctor_name: string             // Required
}
```

---

## Error Handling

All import functions use SweetAlert2 for user feedback:

### Success Response
```javascript
{
  title: 'Success',
  text: 'All X records imported successfully!',
  icon: 'success'
}
```

### Partial Success Response
```javascript
{
  title: 'Partial Success',
  text: `Imported: X, Failed: Y\n\nErrors:\n...`,
  icon: 'warning'
}
```

### Error Response
```javascript
{
  title: 'Error',
  text: 'Error message here',
  icon: 'error'
}
```

---

## Validation Rules

### CSV File Validation
- Must be a valid CSV file
- Maximum size: 5MB
- Cannot be empty

### Column Validation
- All required columns must be present
- Column names are case-sensitive
- Extra columns are ignored

### Data Validation
- No required fields can be empty
- Dates must be in YYYY-MM-DD format
- Times must be in HH:MM format
- Gender must be M, F, or O

### Database Validation
- For appointments: patient_id must exist in patients table
- Phone numbers can be any format
- Emails should be valid format

---

## Batch Processing

Imports are processed in batches of 50 records to:
- Prevent API timeouts
- Improve reliability with large datasets
- Provide better error reporting

**Batch Size:** 50 records per request

**Error Tracking:** Errors are tracked per batch with batch number and error message

---

## Global Variables

### For Patient Import
```javascript
window.patientCSVData  // Stores parsed patient CSV data
```

### For Appointment Import
```javascript
window.appointmentCSVData  // Stores parsed appointment CSV data
```

---

## Dependencies

- **Supabase Client:** `supabaseClient` (must be initialized)
- **SweetAlert2:** For user feedback dialogs
- **Bootstrap:** For styling

---

## Usage Examples

### Example 1: Import with Preview

```javascript
// User selects file
// System parses CSV
// Shows preview table
// User clicks confirm
// System imports to database
```

### Example 2: Direct Import (No Preview)

```javascript
// User unchecks preview checkbox
// Selects CSV file
// System immediately imports to database
// No preview shown
```

### Example 3: Programmatic Import

```javascript
// Prepare data
const patients = [
  { first_name: 'John', last_name: 'Doe', ... }
];

// Import directly
await importPatients(patients);

// Shows result dialog
```

---

## Debugging

### Check Parsed CSV Data
```javascript
console.log(window.patientCSVData);
console.log(window.appointmentCSVData);
```

### Monitor Import Progress
- Check browser console for any errors
- Monitor network requests to Supabase
- Check SweetAlert dialog for status updates

### Browser Console Errors
Most errors are caught and displayed in SweetAlert dialogs, but check console for:
- JavaScript errors
- Network errors
- File parsing errors

---

## Performance Considerations

- **Large Imports:** 1000+ records may take 1-2 minutes
- **Network:** Requires stable internet connection
- **Browser:** Works in all modern browsers
- **Memory:** Large CSV files are streamed, not fully loaded in memory

---

## Security

- All data is validated before insertion
- File size limited to 5MB
- CSV parsing is safe (no code execution)
- Data is sent to Supabase over HTTPS
- Only authenticated users can access import feature

---

## Support

For issues or questions:
1. Check the DATA_IMPORT_GUIDE.md for user documentation
2. Review browser console for error messages
3. Verify CSV format against examples
4. Check Supabase connection status
5. Contact support with error message

---

Last Updated: January 2024
Version: 1.0
