# Data Import - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Access the Feature
```
Dashboard → Data Management → Import Patients / Import Appointments
```

### Step 2: Choose Your CSV File
Use the provided sample files or prepare your own:
- `sample_patients_import.csv`
- `sample_appointments_import.csv`

### Step 3: Import
1. Select CSV file
2. Review preview
3. Click "Confirm Import"
4. Done! ✅

---

## 📋 CSV Column Requirements

### Patients (Required Columns)
```
first_name      → John
last_name       → Doe
email           → john@example.com
phone_number    → 0701234567
date_of_birth   → 1990-05-15 (YYYY-MM-DD)
gender          → M (or F, or O)
national_id     → CM12345678A (optional)
```

### Appointments (Required Columns)
```
patient_id          → 1
appointment_date    → 2024-01-25 (YYYY-MM-DD)
appointment_time    → 09:00 (HH:MM)
reason              → Check-up
doctor_name         → Dr. Smith
```

---

## 📝 Example CSV Files

### Patients Example
```csv
first_name,last_name,email,phone_number,date_of_birth,gender,national_id
John,Doe,john@example.com,0701234567,1990-05-15,M,CM12345678A
Jane,Smith,jane@example.com,0702345678,1988-03-20,F,CM87654321B
```

### Appointments Example
```csv
patient_id,appointment_date,appointment_time,reason,doctor_name
1,2024-01-25,09:00,HIV Test,Dr. Sarah
2,2024-01-25,10:30,Check-up,Dr. James
```

---

## ✨ Features at a Glance

| Feature | Patients | Appointments |
|---------|----------|--------------|
| Bulk import | ✅ | ✅ |
| Preview before import | ✅ | ✅ |
| Validation | ✅ | ✅ |
| Batch processing | ✅ | ✅ |
| Error handling | ✅ | ✅ |
| Max file size | 5MB | 5MB |
| Batch size | 50 records | 50 records |

---

## ⚡ Quick Tips

✅ **Do This:**
- Use sample files as templates
- Start with small batches (10-50 records)
- Review preview before confirming
- Keep original CSV files backed up
- Check dashboard after import

❌ **Don't Do This:**
- Import without reviewing preview
- Use incorrect date format (not YYYY-MM-DD)
- Leave required fields empty
- Close browser during import
- Import duplicate records

---

## 🎯 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Missing columns | Verify column names match exactly |
| Date format error | Use YYYY-MM-DD format |
| Time format error | Use HH:MM format (24-hour) |
| File too large | Split into smaller chunks |
| Import stuck | Wait 1-2 minutes, check connection |
| Some records failed | Check error message, verify data |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **DATA_IMPORT_GUIDE.md** | Complete user guide |
| **DATA_IMPORT_API.md** | Developer reference |
| **DATA_IMPORT_IMPLEMENTATION.md** | Technical details |
| **README_DATA_IMPORT.md** | Full overview |

---

## 🔄 Import Process Flow

```
┌─────────────────────────────┐
│  Select CSV File            │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Parse & Validate File      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Show Preview (optional)    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Confirm Import             │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Process in Batches         │
│  (50 records per batch)     │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  Show Results Dialog        │
│  (Success/Errors)          │
└─────────────────────────────┘
```

---

## ⏱️ Processing Times

| File Size | Records | Time |
|-----------|---------|------|
| Very Small | < 50 | 1-2 sec |
| Small | 50-100 | 2-5 sec |
| Medium | 100-500 | 10-30 sec |
| Large | 500-1000 | 30-60 sec |
| Very Large | 1000+ | 1-2 min |

---

## 🎓 Learning Path

**Beginner:**
1. Read this Quick Start guide
2. Download sample CSV files
3. Import sample data first
4. Check dashboard for results

**Intermediate:**
1. Prepare your own CSV data
2. Start with small batch (10-50)
3. Review preview carefully
4. Monitor import results

**Advanced:**
1. Automate data preparation
2. Optimize CSV format
3. Import in batches
4. Monitor performance
5. Schedule imports

---

## 💾 Sample Files Location

Both files are included in the project:
- `sample_patients_import.csv` - 10 patient examples
- `sample_appointments_import.csv` - 10 appointment examples

Download and use as templates!

---

## 🔐 Security Note

✅ Data is encrypted in transit
✅ Only authenticated users can import
✅ All data is validated
✅ File uploads are limited to 5MB
✅ Import operations are logged

---

## ✅ Pre-Import Checklist

Before importing, verify:
- [ ] CSV file format is correct
- [ ] All required columns present
- [ ] No empty required fields
- [ ] Dates are YYYY-MM-DD format
- [ ] Times are HH:MM format
- [ ] File size under 5MB
- [ ] Patient IDs exist (for appointments)
- [ ] No duplicate records

---

## 🎉 Success Indicators

After import, check:
- ✅ Record count matches
- ✅ Data displays in dashboard
- ✅ No duplicate records
- ✅ All required fields filled
- ✅ Relationships valid
- ✅ No error messages

---

## 📞 Need Help?

1. **First:** Check this Quick Start guide
2. **Then:** Read DATA_IMPORT_GUIDE.md
3. **For details:** See DATA_IMPORT_API.md
4. **For overview:** Check README_DATA_IMPORT.md

---

## 🚀 Ready to Import?

1. Open **Dashboard**
2. Find **Data Management** section
3. Click **Import Patients** or **Import Appointments**
4. Follow the steps above
5. Done!

---

**Version:** 1.0  
**Status:** ✅ Ready to Use  
**Last Updated:** January 2024
