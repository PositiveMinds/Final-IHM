# HealthFlow Chatbot - Example Queries & Use Cases

This guide shows practical examples of how to use the enhanced chatbot with the new features.

---

## Date Range Filtering Examples

### Relative Date Ranges

```
📝 "Show me appointments from last 7 days"
Expected: Lists all appointments scheduled within the past 7 days

📝 "Appointments from last 30 days"
Expected: Shows appointments from the past month

📝 "Last 3 months appointments"
Expected: Displays all appointments in the last 3 months

📝 "Show me critical patients from the last week"
Expected: Lists critical status patients with appointments in past 7 days

📝 "Active patients with appointments last 2 weeks"
Expected: Shows active patients with recent appointments
```

### Absolute Date Ranges

```
📝 "Appointments between 01/01/2024 and 02/28/2024"
Expected: All appointments within Q1 2024

📝 "Show appointments after 01/15/2024"
Expected: All appointments from mid-January onwards

📝 "Appointments before 12/31/2024"
Expected: All appointments before year end

📝 "Between 06/01/2024 and 06/30/2024 appointments"
Expected: All appointments in June 2024
```

### Date Range with Filters

```
📝 "Show HIV positive patients with appointments last 30 days"
Expected: HIV+ patients with recent appointments

📝 "Critical patients appointments from last 7 days"
Expected: Critical status patients with appointments in past week

📝 "Female patients appointments between 01/01/2024 and 02/28/2024"
Expected: Female patients with appointments in specified range

📝 "Diabetes patients with appointments last 60 days"
Expected: Diabetes condition patients with recent appointments
```

---

## Patient Trends Examples

### General Trends

```
📝 "Show patient trends"
Expected:
✓ Total Patients Analyzed
✓ Average Age
✓ Status Distribution (Active vs Critical %)
✓ Viral Load Progress (Undetectable vs Detectable)
✓ Improvement Rate %

📝 "Analyze patient trends"
Expected: Same as above

📝 "What are the current patient trends?"
Expected: Comprehensive trend analysis
```

### Trends with Filters

```
📝 "Show trends for HIV positive patients"
Expected: Trends only for HIV+ population

📝 "Patient trends with diabetes"
Expected: Trends for diabetes patients

📝 "Analyze trends for critical patients"
Expected: Trends for critical status patients

📝 "Female patient trends"
Expected: Trends for female population

📝 "Patient trends for age 50 and above"
Expected: Trends for senior patients

📝 "Trends for patients with undetectable viral load"
Expected: Trends showing improvement progress
```

### Specific Insight Queries

```
📝 "What percentage of patients have undetectable viral loads?"
Expected: Shows improvement rate percentage

📝 "How many active vs inactive patients do we have?"
Expected: Status distribution with counts

📝 "What's the average age of our patients?"
Expected: Shows average age calculation

📝 "Show critical patient trends"
Expected: Focus on at-risk population trends
```

---

## Save Search Examples

### Saving Searches

```
📝 "Show all HIV positive patients"
[Bot shows results]
[User clicks: 💾 Save Search]
[User enters name: "HIV Screening"]
✓ Bot: "Search 'HIV Screening' has been saved!"

📝 "List active patients with diabetes"
[Bot shows results]
[User clicks: 💾 Save Search]
[User enters name: "Diabetes Active Patients"]
✓ Bot: "Search saved!"

📝 "Show me critical patients"
[Bot shows results]
[User clicks: 💾 Save Search]
[User enters name: "Critical Alerts"]
✓ Bot: "Your critical alerts search is saved!"
```

### Using Saved Searches

```
📝 "Show my saved searches"
[Bot displays list of all saved searches with dates]

Option 1: Click on any saved search name to run it again
Option 2: Ask bot: "Use my HIV Screening search"

Expected Output:
✓ Your Saved Searches:
1. HIV Screening (01/15/2024)
2. Diabetes Active Patients (01/10/2024)
3. Critical Alerts (01/18/2024)
```

### Organizing Searches

```
📝 "Save this as daily screening"
[Saves current search with name "daily screening"]

📝 "Save this as weekly report"
[Saves current search with name "weekly report"]

📝 "Remember this as my HIV audit"
[Saves with name "HIV audit"]

📝 "Bookmark this as critical patients check"
[Saves with name "critical patients check"]
```

---

## Combined Query Examples

### Date + Trends + Filters

```
📝 "Show trends for HIV positive patients from last 30 days"
Expected:
- Trends calculated only for past 30 days
- Only HIV positive patients included
- Shows status distribution and improvement rates

📝 "Analyze critical patient trends from last 7 days"
Expected:
- Trends for critical status patients
- Limited to past week data
- Shows trend progression
```

### Date + Stats + Save

```
📝 "Show me appointments from last 60 days then save as quarterly"
[Bot shows appointments from past 60 days]
[Bot shows statistics]
[User clicks Save]
[User enters: "Quarterly Appointments"]
✓ Saved and ready for future use
```

### Filter + Trends + Multiple Conditions

```
📝 "Show trends for female patients age 40 and above with HIV"
Expected:
- Filters: Female, Age ≥40, HIV positive
- Calculates trends for this subset
- Shows status distribution
- Shows viral load improvement

📝 "Patient trends for active males with diabetes"
Expected:
- Filters: Male, Active status, Diabetes condition
- Complete trend analysis for this group
```

---

## Common Business Use Cases

### Daily Clinical Review

```
📝 "Critical patients appointments last 7 days"
Expected: Daily workflow - see critical cases due soon

Save as: "Daily Critical Review"
Use frequency: Every morning
```

### Weekly Quality Assurance

```
📝 "Show patient trends for last 7 days"
Expected: Weekly performance metrics

Save as: "Weekly QA Report"
Use frequency: Every Friday
```

### Monthly Performance Report

```
📝 "Patient trends from last 30 days"
Expected: Monthly aggregate metrics

Then: 📝 "Show HIV positive patient trends last month"
Expected: Detailed HIV program metrics

Save as: "Monthly Performance"
```

### Appointment Scheduling

```
📝 "Appointments from last 14 days not yet scheduled"
Expected: Shows overdue appointments

📝 "Critical patients with no appointments in last 30 days"
Expected: Identifies follow-up gaps

Save as: "Appointment Follow-up"
```

### Cohort Analysis

```
📝 "Patient trends for diabetes patients"
[Get diabetes metrics]
Save as: "Diabetes Cohort"

Then for comparison:
📝 "Patient trends for HIV positive patients"
[Get HIV metrics]
Save as: "HIV Cohort"

Compare the two saved cohorts
```

### Treatment Progress Tracking

```
📝 "Show trends for HIV positive patients"
[See viral load improvement rate]

📝 "Show trends for critical patients"
[See how many moved to non-critical]

Save both as: "Treatment Progress" and "Critical Improvements"
```

---

## Advanced Query Patterns

### Using Multiple Filters

```
🔍 Patient Status + Condition + Date Range
"Show active patients with hypertension from last 30 days"

🔍 Viral Load + Gender + Age Range
"Female patients age 50+ with undetectable viral load"

🔍 Status + Multiple Conditions
"Critical patients with HIV and diabetes"

🔍 Age + Gender + Appointments + Dates
"Male patients age 30-40 with appointments last 60 days"
```

### Comparison Queries

```
1️⃣ Query viral load status:
"Show HIV positive patients with detectable viral load"

2️⃣ Save as "Detectable VL"

3️⃣ Query opposite:
"Show HIV positive patients with undetectable viral load"

4️⃣ Save as "Undetectable VL"

5️⃣ Compare the two searches to see improvement
```

---

## Troubleshooting Query Examples

### If Results Are Empty

```
❌ "Show female patients age 100"
✅ Try: "Show female patients age 50 and above"

❌ "Appointments from next 30 days"
✅ Try: "Show appointments from last 30 days"

❌ "Patients with condition XYZ"
✅ Try: Patients with HIV, Diabetes, Hypertension, TB, or Cancer
```

### Refining Queries

```
Too broad:
"Show all patients"

Better:
"Show active patients"
"Show critical patients"
"Show HIV positive patients"

More specific:
"Show active HIV positive female patients"
"Show critical diabetes patients with undetectable VL"
```

---

## Quick Reference - All Supported Filters

### Status Filters
```
✓ active
✓ inactive  
✓ critical
```

### HIV Status
```
✓ positive
✓ negative
```

### Conditions
```
✓ HIV/AIDS
✓ Hypertension (high blood pressure, HBP)
✓ Diabetes (diabetic, type 2, T2DM)
✓ TB (tuberculosis)
✓ Cancer
```

### Viral Load
```
✓ detectable
✓ undetectable
```

### Demographics
```
✓ male / men / boys
✓ female / women / girls
✓ age X and above
```

### Dates
```
✓ last 7 days
✓ last 30 days
✓ last 3 months
✓ last 1 year
✓ between MM/DD/YYYY and MM/DD/YYYY
✓ after MM/DD/YYYY
✓ before MM/DD/YYYY
```

### Special Queries
```
✓ trends
✓ history
✓ progress
✓ save search
```

---

## Session Example - Complete Workflow

```
1. User opens dashboard
   ↓
2. "Show critical patients"
   Bot: [Displays 5 critical patients]
   [Shows quick action buttons]
   ↓
3. User clicks 💾 Save Search
   ↓
4. Enters name: "Critical Alerts"
   Bot: "✓ Saved!"
   ↓
5. Later: "Show my saved searches"
   Bot: [Lists all 3 saved searches including "Critical Alerts"]
   ↓
6. "Show patient trends"
   Bot: [Displays comprehensive trend analysis]
   ↓
7. "Show appointments from last 30 days"
   Bot: [Lists 47 upcoming appointments]
   [Shows quick action buttons]
   ↓
8. User clicks 💾 Save Search
   ↓
9. Enters name: "Monthly Appointments"
   Bot: "✓ Saved!"
   ↓
10. Page refresh - searches still there
    User: "Show my saved searches"
    Bot: [Shows all saved searches including the new one]
```

---

## Tips for Best Results

✅ **DO:**
- Use natural language
- Specify dates clearly (MM/DD/YYYY format)
- Combine filters for specific results
- Save frequently-used searches
- Check trend analysis monthly

❌ **DON'T:**
- Use future dates for appointments
- Expect results for unknown conditions
- Save too many similar searches
- Rely solely on trends for diagnosis
- Forget to refresh for latest data

---

## Features Coming Soon

🚀 **Export Results** (v2.0)
- Download as CSV
- Generate PDF reports

🌐 **Multi-Language** (v2.1)
- Swahili support
- Luganda support
- Spanish support

📱 **Voice Queries** (v2.2)
- Speak instead of type
- Voice transcription

📧 **Smart Alerts** (v2.3)
- SMS notifications
- Email reports
- Scheduled summaries

---

## Need Help?

**For Feature Requests:** Check the CHATBOT_ENHANCED_FEATURES.md

**For Technical Details:** See CHATBOT_IMPLEMENTATION_SUMMARY.md

**For Issues:** Contact the development team

---

**Happy querying! 🎉**
