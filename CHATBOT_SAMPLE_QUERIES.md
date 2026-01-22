# Chatbot Sample Queries - Quick Reference

## Single Condition Queries

### HIV/AIDS Patients
```
"Show me all HIV positive patients"
"List HIV negative patients"
"How many HIV patients do we have?"
"Find all HIV/AIDS patients"
"Show patients with AIDS"
"HIV positive and active"
```

### Diabetes Patients
```
"Show all diabetes patients"
"List diabetic patients"
"Find patients with diabetes"
"Diabetes type 2 patients"
"How many diabetes patients are active?"
"Show diabetes patients who are female"
```

### Hypertension Patients
```
"List hypertension patients"
"Show patients with high blood pressure"
"HBP patients"
"How many hypertension patients?"
"Find active hypertension patients"
```

### TB Patients
```
"Show tuberculosis patients"
"TB patients"
"List patients with TB"
"Find TB patients who are active"
"How many TB cases?"
```

### Cancer Patients
```
"Cancer patients"
"Show all cancer patients"
"List cancer cases"
"How many cancer patients?"
```

## Status Queries

### Active Patients
```
"Show all active patients"
"List active patients"
"How many active patients?"
"Active patient count"
"All ongoing cases"
```

### Inactive Patients
```
"Show inactive patients"
"List discharged patients"
"Inactive patient count"
"Who are the inactive patients?"
```

### Critical Patients
```
"Show critical patients"
"List critical cases"
"High-risk patients"
"Show urgent cases"
"Alert patients"
"Patients needing attention"
```

## Viral Load Queries

### Detectable Viral Load
```
"Show patients with detectable viral load"
"List detectable cases"
"Detectable viral load"
"Patients with detectable VL"
"Show patients with high viral copies"
```

### Undetectable Viral Load
```
"Show undetectable viral load patients"
"List undetectable cases"
"Patients with undetectable VL"
"Who has undetectable viral load?"
```

## Appointment Queries

```
"Show upcoming appointments"
"List upcoming visits"
"When are the next appointments?"
"Show scheduled appointments"
"What appointments are coming?"
"Next patient visits"
```

## Demographics Queries

### Gender
```
"Show male patients"
"List female patients"
"How many male patients?"
"Female patients with HIV"
"Male diabetes patients"
"All male patients"
```

### Age Range
```
"Show patients age 50 and above"
"Patients over 60"
"List patients older than 30"
"Patients aged 40 and above"
"Find patients above 18"
"Patients age 50+"
```

### Combined Demographics
```
"Female patients aged 40 and above"
"Male diabetes patients over 50"
"Show female HIV patients age 30+"
```

## Combined/Complex Queries

### Multiple Conditions
```
"Show HIV positive patients who are active"
"List female patients with diabetes"
"Find diabetes patients with critical status"
"Show active hypertension patients"
"List HIV positive female patients"
"Find male diabetes patients"
```

### Status + Demographics
```
"Active female patients"
"Critical male patients"
"Inactive patients over 60"
"Show young active patients"
"List elderly critical patients"
```

### Condition + Demographics + Status
```
"HIV positive female patients who are active"
"Diabetic male patients with critical status"
"Female hypertension patients aged 50+"
"Active male TB patients over 30"
"Critical HIV positive patients age 40+"
```

### Viral Load + Demographics
```
"Female patients with detectable viral load"
"Male patients with undetectable VL"
"Patients age 50+ with detectable viral load"
```

## Statistics Queries

```
"How many patients do we have?"
"Total patient count"
"Patient statistics"
"How many active patients?"
"Count of HIV patients"
"Statistics for diabetes patients"
"Summary of critical patients"
"Total number of hypertension patients"
"How many female patients?"
"How many male patients?"
"Patients over 50"
```

## High-Risk Queries

```
"Show high-risk patients"
"Critical patients"
"Patients needing urgent attention"
"Alert patients list"
"Monitor these patients"
"Which patients are in danger?"
"Show urgent cases"
"Alert status patients"
"Patients with critical concerns"
```

## Appointment-Related Queries

```
"When are appointments scheduled?"
"Upcoming patient visits"
"Next appointment list"
"Missed appointments"
"Show scheduled visits"
"Patient appointment schedule"
"When are the next visits?"
```

## Specific Patient Queries

```
"Show patient PAT0025"
"Details for patient 123"
"Patient number 0045"
"Get me patient PAT0001"
"Information about patient PAT0025"
```

## Natural Language Variations

The chatbot understands variations like:

### "Show" variations
- "Display all HIV patients"
- "List active patients"
- "Get me diabetes patients"
- "Find hypertension patients"
- "Tell me about critical patients"
- "What are the active patients?"
- "Which patients have HIV?"

### "How many" variations
- "Count the patients"
- "Total patients"
- "Statistics for patients"
- "Number of active patients"
- "How many do we have?"

### Status variations
- "Active or ongoing patients"
- "Discharged patients"
- "Critical or alert patients"
- "Patients needing attention"

## Pro Tips

1. **Combine filters freely** - "Female HIV positive active patients"
2. **Use natural language** - No need for exact keywords
3. **Gender is understood** - "Show me male patients" works
4. **Age ranges work** - "Patients over 50" or "age 40 and above"
5. **Multiple conditions** - "HIV and diabetes patients"
6. **Status shortcuts** - "critical" or "alert" both work for critical status

## What to Do If Query Doesn't Work

1. Simplify the query - Remove extra conditions
2. Check the console (F12) for extracted filters
3. Verify the exact field values in the database
4. Try a basic query first: "Show all patients"
5. Check that you have data in the database

## Expected Response Times

- **Simple queries**: < 1 second (e.g., "Show all HIV patients")
- **Complex queries**: < 2 seconds (e.g., "Female HIV positive active patients over 50")
- **Statistics queries**: < 1 second (e.g., "How many active patients?")
- **Database errors**: 1-2 seconds with error message

## Example Workflow

```
User: "How many active patients do we have?"
↓
Bot: Shows total active patient count and breakdown by condition

User: "Show me the HIV positive ones"
↓
Bot: Lists all active HIV positive patients

User: "Which are female?"
↓
Bot: Filters to show active HIV positive female patients

User: "Show me critical ones from that list"
↓
Bot: Shows critical female HIV positive patients (if any)
```

