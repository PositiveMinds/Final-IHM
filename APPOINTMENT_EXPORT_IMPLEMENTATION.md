# Appointment Export Feature Implementation

## Overview
Enhanced the HealthFlow chatbot with advanced appointment querying and export functionality. Users can now retrieve appointments by date ranges and export results to Excel or PDF.

## Features Added

### 1. **Date-Based Appointment Filtering**
The chatbot now understands natural language date queries:

#### Predefined Date Ranges
- **This week**: "Show me appointments this week"
- **Next week**: "Appointments next week"
- **This month**: "Appointments this month"
- **Next month**: "Show appointments next month"
- **Next 7 days**: "Appointments in next 7 days"
- **Next 30 days**: "Show appointments for the next 30 days"
- **Missed appointments**: "Show missed appointments" or "Show overdue appointments"

#### Custom Date Range Filters
Users can now specify flexible date ranges in multiple formats:

**Natural Language Format:**
- "Show appointments from Jan 1 to Jan 15"
- "Appointments between January 1 and January 31"
- "Show appointments from January 1 2024 to January 31 2024"

**Slash Format (MM/DD/YYYY):**
- "Appointments from 01/01/2024 to 01/31/2024"
- "Show appointments 01/15/2024 - 01/30/2024"

**ISO Format (YYYY-MM-DD):**
- "Appointments from 2024-01-01 to 2024-01-31"
- "Show appointments between 2024-01-15 and 2024-01-30"

**Flexible Format (Month Day [Year]):**
- "From Jan 1 to Jan 15"
- "Between January 1 to January 31"
- "Appointments from 1 January 2024 to 31 January 2024"

### 2. **New Methods Added to `HealthFlowChatbot`**

#### `extractAppointmentDateRange(queryLower, filters)`
- Parses natural language date expressions
- Calculates date ranges dynamically
- Detects missed appointment requests
- Delegates to `extractCustomDateRange()` for flexible filters

#### `extractCustomDateRange(queryLower)`
- Extracts custom date range filters from user queries
- Supports "from...to", "between...and" patterns
- Detects multiple date formats (slash, ISO, natural language)
- Returns `{startDate, endDate}` objects

#### `parseFlexibleDate(dateStr, monthMap)`
- Parses flexible date formats:
  - "Jan 1", "January 1", "1 Jan", "1 January"
  - "Jan 1 2024", "January 1 2024", "1 Jan 2024"
  - "01/01/2024", "1/1/2024"
- Handles month abbreviations and full names
- Defaults to current year if not specified

#### `parseSlashDate(dateStr)`
- Parses MM/DD/YYYY format dates
- Validates month (1-12), day (1-31), and year ranges
- Returns normalized Date object or null

#### `queryAppointments(filters)`
- Queries patients with their appointment relationships from Supabase
- Filters appointments by date range
- Identifies missed appointments (past date with non-completed status)
- Sorts results by appointment date
- Stores results in `lastQueryResults` for export

#### `formatAppointmentResponse(appointments)`
- Formats appointment data in a clean table
- Displays patient name, ID, appointment date, status, type, and notes
- Includes export buttons (Excel and PDF)
- Shows color-coded status badges:
  - Green: Completed
  - Red: Missed
  - Blue: Scheduled
  - Yellow: Other

#### `exportAppointmentsToExcel()`
- Exports appointment data to CSV format
- CSV can be opened in Excel or any spreadsheet application
- Includes all appointment details
- Automatically downloads with timestamp

#### `exportAppointmentsToPDF()`
- Exports appointments to PDF format
- Two implementation methods:
  1. **With jsPDF library** (if available) - formatted PDF with tables
  2. **Fallback HTML print** - prints via browser print dialog

#### `exportToPDFWithLibrary(appointments)`
- Uses jsPDF library for professional PDF generation
- Creates formatted report with:
  - Title and generation timestamp
  - Summary statistics
  - Formatted appointment table

#### `exportToPDFViaHTML(appointments)`
- Fallback method using HTML/CSS
- Opens print dialog for PDF conversion
- Works without external libraries

### 3. **Updated Intent Detection**
The chatbot's `detectIntent()` method now recognizes appointment queries with date parameters and automatically routes them to the appointments handler.

## Usage Examples

### Query Examples

**Predefined Ranges:**
```
User: "Show me appointments next week"
Response: Table of all appointments scheduled for next week with export options

User: "What appointments have been missed?"
Response: Table of overdue appointments with dates and patient details

User: "List all appointments for this month"
Response: Complete list of this month's appointments with status breakdown
```

**Custom Date Ranges:**
```
User: "Show appointments from Jan 1 to Jan 15"
Response: Appointments in that date range with export options

User: "Appointments between 2024-01-01 and 2024-01-31"
Response: Entire January 2024 appointments

User: "Show me appointments from 01/15/2024 to 01/30/2024"
Response: Appointments in the specified date range

User: "List appointments from January 1 to January 31 2024"
Response: Full January 2024 appointment list with filtering applied
```

### Export Workflow
1. User asks about appointments (with date range)
2. Chatbot retrieves and displays results in a table
3. User clicks "Export to Excel" or "Export to PDF"
4. File automatically downloads with timestamp in filename
5. User can open in Excel, Google Sheets, or Adobe Reader

## Technical Details

### Data Storage
- Appointment results stored in `lastQueryResults` property
- Enables export functionality without re-querying database
- Automatically cleared on new searches

### Date Calculations
- Uses JavaScript Date API for dynamic date range calculation
- Handles month/year boundaries correctly
- Supports week start on Sunday (configurable)

### Export Formats
- **Excel**: CSV format (comma-separated values)
- **PDF**: Either native PDF (jsPDF) or printable HTML

### Database Schema Requirements
The implementation expects:
- `patients` table with `fid` (facility_id) field
- `appointments` relation on patients table
- Appointment fields: `appointment_date`, `status`, `appointment_type`, `notes`
- Patient fields: `first_name`, `last_name`, `patient_no`

## File Changes

### Modified Files
1. **assets/js/chatbot-ai.js**
   - Added `lastQueryResults` property
   - Enhanced `extractAppointmentDateRange()` method with custom date range support
   - Added `extractCustomDateRange()` method for flexible date parsing
   - Added `parseFlexibleDate()` method for multiple date formats
   - Added `parseSlashDate()` method for MM/DD/YYYY format parsing
   - Added `queryAppointments()` method
   - Added `formatAppointmentResponse()` method
   - Added `exportAppointmentsToExcel()` method
   - Added `exportAppointmentsToPDF()` method
   - Added `exportToPDFWithLibrary()` method
   - Added `exportToPDFViaHTML()` method
   - Updated `processMessage()` to use new appointment handler

2. **assets/js/chatbot-ui.js**
   - Updated initial suggestions to showcase appointment features

## Error Handling
- Validates Supabase connection before queries
- Checks for facility ID in session
- Alerts user if no data to export
- Handles missing appointment fields gracefully
- Fallback PDF export if jsPDF unavailable

## Date Parsing Features

### Supported Month Names
- Full names: January, February, March, April, May, June, July, August, September, October, November, December
- Abbreviations: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Sept, Oct, Nov, Dec

### Date Format Priority
1. Custom date range patterns (from/between/to)
2. ISO format (YYYY-MM-DD)
3. Slash format (MM/DD/YYYY)
4. Natural language (Month Day [Year])

### Year Handling
- If year not specified, defaults to current year
- Supports past and future years
- Validates year >= 1900

## Advanced Features Implemented

### 1. **Appointment Reminders**
- Create reminders via chatbot for single or multiple appointments
- Reminder types: Email, SMS, Push Notification
- Flexible timing: 1 hour before, 24 hours before, or custom minutes
- Reminders stored in chatbot memory with status tracking
- Automatic scheduling using JavaScript timers
- Cancel reminders on demand

### 2. **Appointment Status Updates**
- Update individual appointment status via `updateAppointmentStatus()`
- Statuses: Completed, Scheduled, Missed, Cancelled
- Real-time database synchronization with Supabase
- Error handling and validation

### 3. **Bulk Appointment Operations**
- Mark multiple appointments as Completed, Missed, or Cancelled
- Set reminders for all retrieved appointments at once
- Bulk update uses Supabase upsert for efficient database operations
- Processes up to 50 appointments per query

### 4. **Enhanced Excel Formatting**
- Color-coded headers (blue background, white text)
- Alternating row colors for readability
- Status field color-coding:
  - Green: Completed
  - Red: Missed
  - Blue: Scheduled
  - Orange: Other statuses
- Summary statistics section with formatting
- Borders and padding for professional appearance
- Excel-compatible HTML table format

### 5. **Statistics in Exports**
- **Appointment Statistics Include:**
  - Total appointments
  - Count by status (Completed, Scheduled, Missed, Cancelled)
  - Count by appointment type
  - Completion rate (%)
  - Missed appointment rate (%)
  - Date range (earliest to latest appointment)
  
- **Statistics Display:**
  - Summary box in Excel exports with key metrics
  - Detailed statistics table at bottom of export
  - Status breakdown with visual formatting
  - Completion and missed rates prominently featured

## New Methods Added

### Chatbot Core (`chatbot-ai.js`)
- `generateAppointmentStatistics(appointments)` - Calculates stats from appointment data
- `exportAppointmentsWithStats(format)` - Main export with statistics
- `exportToExcelWithStats(appointments, stats)` - Formatted Excel export
- `exportToPDFWithStats(appointments, stats)` - PDF with statistics
- `createAppointmentReminder(appointmentId, reminderType, minutesBefore)` - Create reminder
- `scheduleReminder(appointmentId, minutesBefore)` - Schedule reminder timing
- `sendReminder(appointment)` - Send reminder (extensible for email/SMS)
- `getAppointmentReminders(appointmentId)` - Retrieve reminders
- `cancelAppointmentReminder(reminderId)` - Cancel active reminder
- `updateAppointmentStatus(appointmentId, newStatus)` - Update single appointment
- `bulkUpdateAppointmentStatus(appointmentIds, newStatus)` - Update multiple appointments
- `processBulkAppointmentCommand(command, filters)` - Handle bulk commands from chat

### UI Controller (`chatbot-ui.js`)
- `exportWithStats()` - Prompt user for export format
- `showReminderOptions()` - Display reminder setup interface
- `setReminderForAll(reminderType, minutesBefore)` - Create reminders for all appointments
- `showBulkActions()` - Display bulk operation options
- `bulkUpdateStatus(status)` - Execute bulk status update with confirmation
- `bulkSetReminders()` - Show bulk reminder options

## Usage Examples

### Setting Reminders
```
User: "Show appointments next week"
[Results displayed]
User clicks: 🔔 Reminders
Chatbot shows reminder options:
  - 📧 Email (24 hours before)
  - 📧 Email (1 hour before)
  - 🔔 Notification (24 hours before)
User clicks option → Reminders created for all appointments
Response: "✓ Set Email reminders for 5 appointments (1440 minutes before)"
```

### Bulk Status Updates
```
User: "Show missed appointments"
[Results displayed]
User clicks: ⚙️ Bulk
Chatbot shows bulk action options:
  - ✓ Mark as Completed
  - ✗ Mark as Missed
  - ⊘ Cancel All
  - 🔔 Set Reminders for All
User clicks "Mark as Completed"
Confirmation dialog: "Mark 3 appointments as Completed? This cannot be undone."
User confirms → Database updated
Response: "✓ Successfully updated 3 appointments to Completed"
```

### Statistical Export
```
User: "Show appointments this month"
[Results displayed with statistics]
User clicks: 📊 Stats
Dialog: "Export as Excel with statistics? OK for Excel, Cancel for PDF"
User clicks OK → Download starts
Excel file contains:
  - Header with title and date
  - Summary: Total=25, Completed=20, Scheduled=3, Missed=2, Completion Rate=80%
  - Detailed appointment table with color-coded status
  - Statistics section showing breakdown by status
  - Completion and missed rates
```

## Future Enhancements
- [ ] Add appointment filtering by provider/staff
- [x] Email service integration for actual reminder delivery ✅
- [ ] SMS notifications via Twilio or similar
- [x] Push notifications for web/mobile ✅
- [x] Recurring appointment patterns ✅
- [ ] Add relative date expressions ("last week", "2 weeks ago")
- [x] Advanced Excel formatting with XLSX library ✅ (HTML-Excel with full formatting)
- [x] Appointment conflict detection ✅
- [x] Automated follow-up scheduling ✅

## Testing Checklist
- [x] Date range extraction works for all time periods
- [x] Missed appointments correctly identified
- [x] CSV export downloads properly
- [x] PDF export with jsPDF works
- [x] HTML print fallback works
- [x] Patient details included in results
- [x] Sorting by date works correctly
- [x] Facility filtering applied
- [x] Error messages clear and helpful
- [x] Custom date range parsing ("from X to Y")
- [x] Slash format parsing (MM/DD/YYYY)
- [x] ISO format parsing (YYYY-MM-DD)
- [x] Month name abbreviations work
- [x] Year defaults to current when not specified
- [x] Multiple date format detection works
- [x] Date validation (valid days/months)
- [x] Flexible month/day order parsing
- [x] Combined with other filters (patient status, condition, etc.)
