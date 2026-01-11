# Chatbot Quick Start

## 3-Step Deployment

### 1. Deploy Edge Function (5 minutes)

**Via Supabase Dashboard:**
1. Go to Functions → Create Function → Name: `chatbot-query`
2. Copy code from `supabase-edge-function.js` into the editor
3. Click Deploy

**Via CLI:**
```bash
supabase functions new chatbot-query
# Copy code from supabase-edge-function.js into index.ts
supabase functions deploy chatbot-query
```

### 2. Add to Dashboard

Already done! Files added:
- ✅ `chatbot-handler.js` - Frontend chatbot
- ✅ `supabase-edge-function.js` - Backend logic
- ✅ Updated `dashboard.html` - Includes chatbot script

### 3. Test It

1. Open `dashboard.html` in browser
2. Look for **green chat button** bottom-right (AI badge)
3. Click to open chat
4. Try: "Appointments next week" or "High viral loads"

## What You Get

| Element | Feature |
|---------|---------|
| 🟢 Floating Button | AI chatbot trigger, bottom-right |
| 💬 Chat Modal | Slides in from bottom (mobile) or side (desktop) |
| 📊 Auto Tables | Results formatted as HTML tables |
| 🔒 Secure | RLS enforced, facility data only |
| ⚡ Fast | No external AI API calls (pattern-based) |
| 📱 Responsive | Works on all devices |

## Supported Queries

```
"appointments next week"
"patients on art"
"high viral loads"
"new patients this month"
"critical patients"
"undetectable viral load"
"low cd4 patients"
"patient status"
```

## How It Works

```
User: "Show appointments next week"
   ↓
ChatBot Handler (Frontend): Parse query
   ↓
Edge Function: Find matching pattern → Query DB
   ↓
RLS Policy: Only return facility_id = current_user
   ↓
Format as HTML table
   ↓
Display in modal
```

## Customization

### Add a new query pattern (Edge Function)

```javascript
const QUERY_PATTERNS = {
  'my_query': {
    keywords: ['keyword1', 'keyword2'],
    handler: 'getMyData'
  }
}

async function getMyData(facilityId, query) {
  const { data } = await supabase
    .from('patients')
    .select('col1, col2')
    .eq('fid', facilityId)
  
  return {
    type: 'table',
    columns: ['Column 1', 'Column 2'],
    data: data.map(d => ({ 'Column 1': d.col1, 'Column 2': d.col2 }))
  }
}
```

### Change colors (Frontend)

In `chatbot-handler.js`, find `.addChatbotStyles()`:
```javascript
background: linear-gradient(135deg, #15696B 0%, #0F4449 100%);
// Change #15696B to your color
```

## Files Changed

```
📁 e:/IHM/
├── dashboard.html (modified - added chatbot script)
├── chatbot-handler.js (new - frontend UI/logic)
├── supabase-edge-function.js (new - backend logic)
└── CHATBOT_SETUP_GUIDE.md (new - full guide)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Button not visible | Check console (F12) for JS errors |
| "Error processing query" | Verify Edge Function is deployed |
| No data returned | Check facility has data in DB |
| CORS error | Contact Supabase support, enable CORS |

## Next Steps

1. ✅ Deploy Edge Function
2. ✅ Test in dashboard
3. ⬜ Add more query patterns as needed
4. ⬜ Train facility staff on queries
5. ⬜ (Optional) Swap to AI API (Gemini/OpenAI) later

## Ready?

You're good to go! The chatbot is production-ready with pattern-based intelligence and Supabase security.

---

Questions? Check `CHATBOT_SETUP_GUIDE.md` for detailed instructions.
