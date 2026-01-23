# HealthFlow AI Assistant - User Guide

## 🤖 Getting Started

The HealthFlow AI Assistant is your intelligent healthcare data companion. Ask it questions about patients, appointments, and health metrics in plain English.

---

## 💬 How to Use

### **1. Open the Assistant**
- Click the **💬 chat bubble** button in the bottom right corner
- The chat window appears in full screen

### **2. Ask a Question**
- Type your question in natural language
- Press **Enter** or click the **send button** (✈️)
- The bot processes and returns results

### **3. View Results**
- Results appear in a formatted table or summary
- Below results, you'll see 3 action buttons:
  - 💾 **Save Search** - Save this query for later
  - 📋 **My Searches** - View all saved searches
  - 📥 **Export** - Download results as Excel or PDF

### **4. Export Data**
- Click **Export** button
- Choose format:
  - **📊 Download Excel** - Formatted spreadsheet
  - **📄 Download PDF** - Professional report
- File downloads automatically (timestamped)

---

## 📋 Common Questions

### **Today's Appointments**
```
"How many patients are on appointment today?"
"Count appointments for today"
"How many visits today?"
```

### **Future Appointments**
```
"Show appointments today"
"This week's appointments"
"Last week's appointments"
"Next week's appointments"
"This month's appointments"
"Last month's appointments"
"Next month's appointments"
"Appointments in the next 30 days"
"Show appointments between 15 February and 31 February 2026"
"Appointments from 10 March to 25 March"
"How many coming between 1 Jan and 31 Jan?"
```

#### **Efficient Appointment Retrieval**
The chatbot retrieves appointments efficiently using optimized, pre-calculated queries:

**Daily/Weekly Range:**
- **Today:** `"Show appointments today"` or `"Appointments today"`
- **This Week:** `"This week's appointments"` – Monday to Sunday of current week
- **Last Week:** `"Last week's appointments"` – Monday to Sunday of previous week
- **Next Week:** `"Next week's appointments"` – Monday to Sunday of next week

**Monthly Range:**
- **This Month:** `"This month's appointments"` – 1st to last day of current month
- **Last Month:** `"Last month's appointments"` – 1st to last day of previous month
- **Next Month:** `"Next month's appointments"` – 1st to last day of next month

**Extended Range:**
- **Past 30 Days:** `"Appointments from last 30 days"` or `"Past 30 days"`
- **Next 30 Days:** `"Appointments in the next 30 days"` or `"Next 30 days"`

**Custom Date Ranges:**
- **Exact dates:** `"Between 15 February and 31 February 2026"`
- **Month ranges:** `"Appointments from 10 March to 25 March"`
- **Full month:** `"All appointments in January 2026"`

#### **Week Range (Monday–Sunday)**
When asking for appointments **this week** or **next week**, the system uses the ISO week standard:
- **Week starts:** Monday
- **Week ends:** Sunday
- Example: If today is Wednesday, "next week" means the following Monday through Sunday

### **Viral Load Status**
```
"How many patients are not suppressing?"
"Show suppressed patients" 
"Who has detectable viral load?"
"How many with undetectable VL?"
```

### **Pregnant Patients**
```
"How many pregnant mothers?"
"List expecting mothers"
"Show pregnant patients"
```

### **Patient Search**
```
"Show all HIV positive patients"
"List active patients with diabetes"
"Female patients over 30"
"How many critical patients?"
```

### **Patient Risk & Status**
```
"Show critical patients"
"How many critical cases do we have?"
"Critical patients needing attention"
```

### **IAC Program**
```
"IAC patients"
"Show patients in the Integrated Antiretroviral Clinic"
"ART clinic patients"
"Patients on antiretroviral therapy"
```

### **Lab Tests Due**
```
"Patients due for viral load test"
"Who needs a bleeding test?"
"Overdue for viral load testing"
"Patients due for VL test"
```

### **Chronic Conditions**
```
"Diabetes patients"
"Hypertension patients"
"Show diabetic patients"
"Patients with high blood pressure"
```

### **Combined Filters**
```
"Show active pregnant mothers with detectable viral load"
"Critical female patients aged over 45 with HIV"
"Hypertension patients with undetectable viral load"
"Diabetes patients due for viral load test"
```

---

## 💾 Saving Searches

### **Save Current Search**
1. After running a query, click **💾 Save Search**
2. Enter a name (e.g., "Monthly Pregnant Report")
3. Click "Save"
4. Bot confirms: "✅ Saved as 'Monthly Pregnant Report'"

### **View Saved Searches**
1. Click **📋 My Searches**
2. See all saved searches with:
   - Search name
   - Applied filters
   - When it was saved
3. Two buttons per search:
   - **Load** - Re-run the search
   - **✕** - Delete the search

### **Load a Saved Search**
1. Click **📋 My Searches**
2. Find the search you want
3. Click the **Load** button
4. Bot automatically runs the search again

---

## 📊 Exporting Results

### **Export as Excel**
1. Click **📥 Export**
2. Click **📊 Download Excel**
3. File saves as: `HealthFlow_Export_[DATE].xlsx`
4. Open with Microsoft Excel or similar

**Features:**
- ✅ Teal colored headers with white text
- ✅ Alternating row colors (light gray / white)
- ✅ No text wrapping in headers
- ✅ Auto-sized columns
- ✅ Professional formatting

### **Export as PDF**
1. Click **📥 Export**
2. Click **📄 Download PDF**
3. File saves as: `HealthFlow_Export_[DATE].pdf`
4. Open with any PDF reader

**Features:**
- ✅ Professional layout
- ✅ Title and timestamp
- ✅ Formatted table
- ✅ Page-optimized
- ✅ Ready to print or share

---

## 🎯 Tips for Best Results

### ✅ DO

- **Use natural language**
  - "How many pregnant mothers?"
  - "Show not suppressing patients"
  - "Appointments between March 1 and April 15"

- **Include specific dates**
  - "Between 15 February and 31 February"
  - "From March 10 to March 25"

- **Combine filters when relevant**
  - "Active female patients with HIV"
  - "Critical pregnant mothers"

- **Use keywords**
  - "How many patients have appointments today?"
  - "Show well-suppressed patients"

### ❌ DON'T

- **Use vague queries**
  - ❌ "Patients?" 
  - ✅ "How many patients do we have?"

- **Use incomplete dates**
  - ❌ "Between February"
  - ✅ "Between 15 February and 31 February"

- **Mix conflicting filters**
  - ❌ "HIV positive and negative patients"
  - ✅ "HIV positive patients"

- **Use unclear abbreviations**
  - ❌ "Pts with VL?"
  - ✅ "How many patients with detectable viral load?"

---

## 📅 Date Format Guide

### **Supported Formats**

**Full month names:**
- "between 15 February and 31 February"
- "from 10 March to 25 March"
- "January 1 to January 31"

**Abbreviated months:**
- "between 15 Feb and 31 Feb"
- "from 10 Mar to 25 Mar"
- "1 Jan to 31 Jan"

**Without year (uses current year):**
- "between 15 February and 31 February"
- "from 10 to 25 March"

**With year:**
- "between 15 February and 31 February 2026"
- "from 10 March to 25 March 2026"

---

## 🔍 What Data Can You Query?

### **Patient Information**
- Status: Active, Inactive, Critical
- HIV Status: Positive, Negative
- Conditions: HIV/AIDS, Diabetes, Hypertension, TB, Cancer
- Pregnancy Status
- Age

### **Appointments**
- Next appointment date
- Appointments by date range
- Appointments today
- Upcoming appointments

### **Viral Load**
- Viral load status: Detectable, Undetectable
- Viral copy count
- Suppression status

### **Demographics**
- Age
- Gender: Male, Female
- Patient ID

---

## 🆘 Troubleshooting

### **No Results Found**
- Check that your filters match available data
- Try broader search criteria
- Use "Show all patients" to verify database connection

### **Date Not Recognized**
- Use full month names (January) or standard abbreviations (Jan)
- Include both start and end dates: "between 15 Feb and 31 Feb"
- Format: [DAY] [MONTH] and [DAY] [MONTH]

### **Export Not Working**
- Allow popups for the site
- Check browser security settings
- Ensure sufficient disk space
- Try different file format (PDF if Excel fails)

### **Saved Search Not Loading**
- Check browser's localStorage is enabled
- Clear browser cache and try again
- Re-save the search with a different name

---

## 🚀 Example Workflow

### **Scenario: Monthly Report for Pregnant Mothers**

1. **Query:** "How many pregnant mothers do we have?"
   - Bot returns: Count + Table of pregnant patients

2. **Save:** Click **💾 Save Search** → Name it "Pregnant Mothers - Monthly"
   - Bot confirms: "✅ Saved as 'Pregnant Mothers - Monthly'"

3. **Export:** Click **📥 Export** → Click **📊 Download Excel**
   - File downloads: `HealthFlow_Export_2026-01-23.xlsx`

4. **Share:** Open Excel file, add your notes, send to stakeholders

5. **Next Month:** 
   - Click **📋 My Searches** 
   - Find "Pregnant Mothers - Monthly"
   - Click **Load** to instant repeat

---

## 📱 Mobile Usage

- ✅ Works on tablets and phones
- ✅ Full-screen chat interface
- ✅ Touch-friendly buttons
- ✅ Auto-stacking of action buttons
- ✅ Responsive tables and exports

---

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Shift + Enter** | New line in message |
| **Escape** | Close chat (when focused) |

---

## 🔐 Privacy & Security

- ✅ All queries processed securely
- ✅ No personal data stored in chat history
- ✅ Exports created locally on your device
- ✅ Data only queried from authorized database
- ✅ HIPAA compliant processing
- ✅ Optimized appointment queries (pre-calculated date ranges)
- ✅ Week calculations (Monday–Sunday) for appointment queries

---

## 📞 Support

For issues or feature requests:
- Contact: support@healthflow.ug
- Phone: +256 775 582 968
- WhatsApp: [Click to chat](https://wa.me/256775582968)

---

## 🎓 Learn More

- **Advanced Guide:** See `CHATBOT_ADVANCED_NLP_GUIDE.md`
- **Quick Examples:** See `CHATBOT_QUICK_QUERY_EXAMPLES.md`
- **Technical Details:** See `CHATBOT_ENHANCEMENT_SUMMARY.md`

---

*HealthFlow AI Assistant*
*Making Healthcare Data Simple*
*Version 2.0 - January 2026*
