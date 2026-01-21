# Chatbot Quick Queries Reference

**Free, instant, facility-specific healthcare queries. No AI costs.**

## How to Use

1. Click the green **AI** button (bottom-right of dashboard)
2. Type your question exactly as shown below
3. See instant results in a table or summary

---

## Quick Query Examples

### HIV/AIDS Management

```
"show me patients on art"
"first line art patients"
"second line art patients"
"high viral load"
"undetectable viral load"
"low cd4 patients"
"cd4 below 50"
"due for viral load test"
"due for cd4 test"
```

### TB/HIV

```
"tb hiv patients"
"patients on tb treatment"
"tb hiv coinfection"
```

### Non-Communicable Diseases (NCDs)

```
"hypertension patients"
"uncontrolled blood pressure"
"diabetes patients"
"uncontrolled diabetes"
"patients on insulin"
"heart disease"
"chronic kidney disease"
"asthma patients"
"cancer patients"
```

### Pregnancy & Maternal Health

```
"pregnant patients"
"antenatal patients"
"postnatal patients"
"maternal complications"
```

### Appointments & Follow-up

```
"appointments today"
"appointments next week"
"missed appointments"
"defaulters"
"overdue clinic review"
"appointment overdue"
```

### Lab Tests & Monitoring

```
"due viral load test"
"due cd4 test"
"overdue lab tests"
"viral load blips"
"virological failure"
```

### Medication & Refills

```
"overdue refill"
"medication refill due"
"stock out"
"medication unavailable"
```

### Population Groups

```
"female patients"
"male patients"
"adolescent patients"
"elderly patients"
"total patients"
"patient breakdown"
```

### Statistics & Summary

```
"total patients"
"patient breakdown"
"facility summary"
"monthly statistics"
"how many patients hiv positive"
```

---

## What's Running in the Background

| Query | Database Table | Filter | Result |
|-------|---|--------|--------|
| "on art" | patients | art_status='Active' | Table of ART patients |
| "high viral" | patients | viral_load > 1000 | High VL patients |
| "undetectable" | patients | viral_load < 50 | U=U patients |
| "overdue refill" | patients | last_refill < 30 days | Needs medication |
| "pregnant" | patients | pregnancy_status='Pregnant' | Antenatal patients |

---

## Benefits

✅ **Zero Cost** - No API charges  
✅ **Instant Results** - No waiting for AI  
✅ **Secure** - Facility data only (RLS enforced)  
✅ **Accurate** - Pattern-based, not hallucinated  
✅ **Offline Ready** - Works without internet (with local Supabase)

---

## Tips

- Use simple, natural language
- Don't worry about spelling
- Try different phrasings if unsure
- Results limited to your facility (if logged in)
- Up to 50 patients per query

---

## Staff Training

**Show facility staff:**
1. Click the green AI button
2. Type "total patients"
3. See instant facility summary
4. Try "appointments today"

**Most used queries:**
- "total patients" (facility stats)
- "appointments today" (schedule)
- "overdue refill" (medication gaps)
- "high viral load" (clinical alerts)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not visible | Refresh browser (F5) |
| "I don't understand" | Rephrase using words above |
| No results | Facility might not have data of this type |
| Connection error | Check internet, refresh dashboard |

---

**Updated:** January 2026  
**Status:** Production Ready  
**Cost:** $0
