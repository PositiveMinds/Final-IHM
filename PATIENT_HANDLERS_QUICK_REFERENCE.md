# Patient Query Handlers - Quick Reference

## All Available Patient Queries

### ✅ Risk & Status (NEW)

**Critical Patients**
```
"Show critical patients"
"Critical cases"
→ Handler: getCriticalPatients()
→ Filters: status = 'Critical'
```

**High-Risk Patients**
```
"High-risk patients"
"At-risk patients"
→ Handler: getHighRiskPatients()
→ Filters: Calculated risk score ≥ 50
```

---

### ✅ Antiretroviral Therapy (NEW)

**IAC Patients**
```
"IAC patients"
"Show IAC"
"ART clinic"
→ Handler: getIACPatients()
→ Filters: HIV+ with medication regimen
```

**ART Patients (General)**
```
"ART patients"
"Patients on antiretroviral"
→ Handler: getARTPatients()
→ Filters: hiv_status = 'Positive'
```

---

### ✅ Lab Tests Due (NEW)

**Viral Load Test Due**
```
"Patients due for viral load test"
"Due for bleeding test"
"Overdue for VL test"
→ Handler: getDueForBleedingTest()
→ Filters: last_viral_load_date > 90 days ago
```

**Viral Load Test Due (Existing)**
```
"Due for viral load"
"Test due soon"
→ Handler: getDueForViralLoadTest()
→ Filters: Different criteria
```

---

### ✅ Viral Load Status

**High Viral Load**
```
"High viral load"
"Not suppressing"
→ Handler: getHighViralLoadPatients()
→ Filters: last_viral_load > 1000
```

**Undetectable (Suppressed)**
```
"Undetectable"
"Suppressed"
"U=U"
→ Handler: getUndetectablePatients()
→ Filters: last_viral_load ≤ 50
```

---

### ✅ Chronic Conditions

**Diabetes**
```
"Diabetes patients"
"Show diabetics"
"Type 2 diabetes"
→ Handler: getDiabetesPatients()
→ Filters: condition = 'Diabetes'
```

**Hypertension**
```
"Hypertension patients"
"High blood pressure"
"HTN patients"
→ Handler: getHypertensionPatients()
→ Filters: condition = 'Hypertension'
```

**Tuberculosis**
```
"TB patients"
"Tuberculosis"
→ Handler: getTuberculosisPatients()
→ Filters: condition = 'TB'
```

**Cancer**
```
"Cancer patients"
"Malignancy"
→ Handler: getCancerPatients()
→ Filters: condition = 'Cancer'
```

**Heart Disease**
```
"Heart disease"
"Cardiac"
"CVD"
→ Handler: getHeartDiseasePatients()
→ Filters: condition = 'Heart Disease'
```

**Asthma**
```
"Asthma"
"Respiratory"
→ Handler: getAsthmaPatients()
→ Filters: condition = 'Asthma'
```

**CKD (Chronic Kidney Disease)**
```
"CKD"
"Kidney disease"
"Renal"
→ Handler: getCKDPatients()
→ Filters: condition = 'CKD'
```

**Mental Health**
```
"Mental health"
"Depression"
"Psychiatric"
→ Handler: getMentalHealthPatients()
→ Filters: condition = 'Mental Health'
```

---

### ✅ CD4 Count

**Low CD4**
```
"Low CD4"
"CD4 < 200"
→ Handler: getLowCD4Patients()
→ Filters: last_cd4_count < 200
```

**Due for CD4 Test**
```
"Due for CD4"
"CD4 test"
→ Handler: getDueForCD4Test()
→ Filters: Time-based
```

---

### ✅ Demographics

**Total Patients**
```
"How many patients"
"Total patients"
→ Handler: getTotalPatients()
```

**Female Patients**
```
"Female patients"
"Women"
→ Handler: getFemalePatients()
→ Filters: gender = 'F'
```

**Male Patients**
```
"Male patients"
"Men"
→ Handler: getMalePatients()
→ Filters: gender = 'M'
```

**New Patients**
```
"New patients"
"Recently registered"
→ Handler: getNewPatients()
→ Filters: Last 30 days
```

---

### ✅ Pregnancy

**Pregnant Patients**
```
"Pregnant patients"
"Expecting mothers"
"Pregnancy"
→ Requires custom filter in query
```

---

### ✅ Medications

**Refill Due**
```
"Refill due"
"Medication refill"
"Due for medication"
→ Handler: getOverdueRefillPatients()
→ Filters: Overdue refills
```

---

### ✅ Status-Based

**By Patient Status**
```
"Active patients"
"Inactive patients"
"Critical patients"
→ Handler: getPatientsByStatus()
→ Filters: status field
```

**Complications**
```
"With complications"
"Adverse effects"
→ Handler: getPatientsWithComplications()
→ Filters: complications field
```

---

### ✅ Appointments

**Today**
```
"Today's appointments"
→ Handler: getAppointmentsToday()
```

**This Week**
```
"This week"
→ Handler: getAppointmentsThisWeek()
```

**Last Week**
```
"Last week"
→ Handler: getAppointmentsLastWeek()
```

**Next Week**
```
"Next week"
→ Handler: getAppointmentsNextWeek()
```

**This Month**
```
"This month"
→ Handler: getAppointmentsThisMonth()
```

**Last Month**
```
"Last month"
→ Handler: getAppointmentsLastMonth()
```

**Next Month**
```
"Next month"
→ Handler: getAppointmentsNextMonth()
```

**Next 30 Days**
```
"Next 30 days"
→ Handler: getAppointmentsNext30Days()
```

---

## Combined Query Examples

```
"Critical HIV+ patients with diabetes"
→ getCriticalPatients() + filter for HIV+ + filter for diabetes

"IAC patients not suppressing"
→ getIACPatients() + filter for high viral load

"Hypertension patients overdue for VL test"
→ getHypertensionPatients() + filter for last_viral_load_date > 90 days

"Female critical patients aged over 40"
→ getCriticalPatients() + filter for gender=F + filter for age>40

"Diabetes patients on ART"
→ getDiabetesPatients() + filter for HIV+/on ART

"Pregnant mothers with detectable viral load"
→ Query filter for pregnancy + filter for viral_load > 50

"Active IAC patients due for CD4 test"
→ getIACPatients() + getDueForCD4Test() results
```

---

## Handler Statistics

**Total Handlers:** 30+

**Categories:**
- Appointments: 8 handlers
- Patient Status/Risk: 3 new + 2 existing = 5 total
- Viral Load: 3 handlers
- CD4: 2 handlers
- Conditions: 8 handlers
- Demographics: 4 handlers
- Additional: 3-5 handlers

**Most Used:**
1. Appointments (Multiple time periods)
2. Critical/High-Risk Patients
3. Viral Load Status
4. Condition-based (Diabetes, HTN)

**Newest (Today):**
1. getCriticalPatients
2. getIACPatients
3. getDueForBleedingTest

---

## Performance Notes

All handlers use index-friendly queries:
- Single facility filter (`fid`)
- Simple field equality checks (`status`, `condition`, `hiv_status`)
- OR date-range queries with indexes

Expected response times: **<50ms** for typical facilities

---

## User Guide Location

See `CHATBOT_USER_GUIDE.md` for:
- Common questions section
- Detailed query examples
- Tips for best results
