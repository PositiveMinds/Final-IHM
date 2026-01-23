# HealthFlow AI Assistant - Advanced NLP Guide

## Overview
The HealthFlow AI Assistant now understands natural human language queries with advanced Natural Language Processing (NLP) capabilities.

## Supported Query Types

### 1. **Appointment Statistics - Today**
Ask the chatbot how many patients have appointments today.

**Example Queries:**
- "How many patients are on appointment today?"
- "How many appointments do we have today?"
- "Count patients coming in today"
- "How many visits are scheduled for today?"

**What it does:**
- Filters all patients with appointments
- Checks which ones have appointments on today's date
- Returns count and detailed list

---

### 2. **Appointment Statistics - Date Range**
Ask about appointments within a specific date range.

**Example Queries:**
- "How many patients are coming between 15 February and 31 February 2026?"
- "Show appointments from 10 March to 25 March 2026"
- "How many visits between 1 Jan and 31 Jan?"
- "Appointments from 15 to 28 December"

**Format:**
- `between [DAY] [MONTH] and [DAY] [MONTH] [YEAR]`
- `from [DAY] [MONTH] to [DAY] [MONTH]`
- Supports full month names (January, February, etc.) and abbreviations (Jan, Feb, etc.)
- Year is optional (defaults to current year if not specified)

**What it does:**
- Extracts date range from query
- Filters patients with appointments in that date range
- Returns count and formatted table with patient names and appointment dates

---

### 3. **Viral Suppression Status**
Ask about patients based on their viral load suppression status.

#### **Not Suppressing (Detectable Viral Load)**
**Example Queries:**
- "How many patients are not suppressing?"
- "Show patients not suppressing the virus"
- "List suppression failures"
- "Who has unsuppressed viral load?"
- "How many patients have detectable viral load?"

**What it does:**
- Finds all patients with DETECTABLE viral load status
- Returns count and table showing patient name, viral load status, and viral copies

#### **Suppressing (Undetectable Viral Load)**
**Example Queries:**
- "How many patients are suppressing?"
- "Show well-suppressed patients"
- "List patients with undetectable viral load"
- "Who has adequately suppressed virus?"

**What it does:**
- Finds all patients with UNDETECTABLE viral load status
- Returns count and table showing patient names and viral load status

---

### 4. **Pregnant Mothers**
Ask about pregnant patients in the system.

**Example Queries:**
- "How many pregnant mothers do we have?"
- "List expecting mothers"
- "Show pregnant patients"
- "How many patients are pregnant?"

**What it does:**
- Filters patients marked as pregnant (checks `is_pregnant` or `pregnancy_status` field)
- Returns count and detailed table with patient names, ages, and status

---

### 5. **Patient Search with Filters**
General patient searches with multiple filter combinations.

**Example Queries:**
- "Show all HIV positive patients"
- "List active patients with diabetes"
- "Show critical patients with hypertension"
- "Find female patients over 30"

**Available Filters:**
- **Status:** Active, Inactive, Critical
- **HIV Status:** Positive, Negative
- **Conditions:** HIV/AIDS, Diabetes, Hypertension, TB, Cancer
- **Viral Load:** Detectable, Undetectable
- **Gender:** Male (M), Female (F)
- **Age:** Over/above/older than [number]

---

### 6. **Patient Statistics**
Get aggregated statistics about patients.

**Example Queries:**
- "How many patients do we have?"
- "Show patient statistics"
- "What's the total count?"
- "Give me an overview of patients"

**What it does:**
- Returns total patient count
- Average age of all patients
- Breakdown by status
- Breakdown by condition
- Breakdown by HIV status

---

## Advanced Features

### **Intent Detection Priority**
The chatbot uses a priority system to determine intent:

1. `patient_stats` - Statistics queries (highest priority)
2. `viral_load` - Viral load specific queries
3. `high_risk` - Critical/urgent patient queries
4. `appointments` - Appointment-related queries
5. `patient_search` - General patient searches (lowest priority)

New intents (higher priority):
- `appointment_stats` - Appointment statistics
- `date_range_query` - Date range appointment queries
- `pregnancy` - Pregnant patient queries
- `viral_suppression` - Viral suppression status queries

### **Date Parsing**
The system automatically parses dates in natural language:

**Supported Formats:**
- Full month names: "January", "February", "March", etc.
- Abbreviated months: "Jan", "Feb", "Mar", etc.
- Day and month: "15 February", "3 March"
- Multiple months: "between 15 February and 31 December"
- Year optional: Defaults to current year if not specified

**Example:**
- Query: "Between 15 February and 31 February 2026"
- Parsed: Date from: Feb 15, 2026 → Date to: Feb 31, 2026

### **Filter Combination**
You can combine multiple filters in a single query:

**Examples:**
- "Show active female patients with HIV" 
  - Combines: Status=Active, Gender=F, HIV Status=Positive
  
- "How many critical patients aged over 45?"
  - Combines: Status=Critical, Age>45

- "List pregnant mothers with detectable viral load"
  - Combines: Is Pregnant=true, Viral Load Status=Detectable

---

## Export Results

After any query, the chatbot provides quick action buttons:

1. **💾 Save Search** - Save this search with a custom name
2. **📋 My Searches** - View all your saved searches
3. **📥 Export** - Download results as:
   - **Excel** (.xlsx) - Fully formatted with colored headers and alternating rows
   - **PDF** - Professional PDF report with tables

All exported files are timestamped and include the full result set.

---

## Error Handling

The chatbot gracefully handles:
- Empty result sets ("No patients found matching your criteria")
- Database connection errors
- Invalid date formats
- Missing data fields

Error messages are clear and actionable.

---

## Example Conversation Flow

**User:** "How many patients are not suppressing?"

**Bot:** 
- Detects intent: `viral_suppression`
- Extracts filter: `search_type = "not_suppressing"`
- Queries database for patients with `viral_load_status = "Detectable"`
- Returns count and formatted table
- Shows action buttons: Save Search | My Searches | Export

**User:** "How many are pregnant?"

**Bot:**
- Detects intent: `pregnancy`
- Filters for pregnant patients
- Returns count and detailed table
- Shows action buttons again

**User:** "Export"

**Bot:**
- Shows export options: Excel | PDF
- Allows user to download formatted results

---

## Technical Details

### **New Intents Added**
- `appointment_stats` - Handles "How many appointments" queries
- `date_range_query` - Handles "between X and Y" date range queries
- `pregnancy` - Handles pregnant patient queries
- `viral_suppression` - Handles viral suppression status queries

### **Enhanced Filter Extraction**
- **Date Range:** Automatically parses "between X and Y" patterns
- **Date Today:** Detects "today" references
- **Pregnancy Status:** Detects pregnancy-related keywords
- **Viral Suppression:** Detects suppressing/not suppressing keywords
- **Month Parsing:** Converts month names to numbers with year handling

### **Storage Requirements**
For full functionality, the `patients` table should include:
- `next_appointment` - DateTime field for appointment scheduling
- `viral_load_status` - "Detectable" or "Undetectable"
- `viral_load_copies` - Optional numeric field for viral copy count
- `is_pregnant` or `pregnancy_status` - Boolean or status field

---

## Tips for Best Results

1. **Be Natural** - The chatbot understands casual language
   - ✅ "How many pregnant mothers?" 
   - ✅ "Show not suppressing patients"
   - ✅ "Appointments between March 1 and April 15"

2. **Include Dates** - For date range queries, always include full dates
   - ✅ "Between 15 February and 31 February"
   - ❌ "Between February" (ambiguous)

3. **Use Keywords** - Include relevant keywords for better detection
   - ✅ "How many patients have appointments today?"
   - ❌ "Appointments?" (too vague)

4. **Combine Filters** - You can mix different filter types
   - ✅ "Show active patients with viral suppression"

5. **Save Searches** - Save frequently used queries for quick access
   - Click "Save Search" button after results
   - Name it meaningfully: "Monthly Pregnant Mothers Report"

---

## Supported Databases

- Supabase (Current)
- Extensible to other SQL databases

---

*Last Updated: January 2026*
*HealthFlow AI Assistant v2.0*
