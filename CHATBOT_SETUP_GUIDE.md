# Facility Chatbot Setup Guide

A pattern-based intelligent chatbot integrated with Supabase Edge Functions for secure, facility-specific patient queries.

## Architecture Overview

```
Dashboard (chatbot-handler.js)
         ↓ (HTTPS API call)
Supabase Edge Function (chatbot-query)
         ↓ (RLS enforced)
Supabase PostgreSQL Database
```

## Features

✅ Pattern-based intelligence (no AI API needed initially)  
✅ Floating button with smooth animations  
✅ Slide-in modal chat interface  
✅ Table formatting for query results  
✅ Facility-level data filtering (RLS enforced)  
✅ Responsive design (desktop & mobile)  
✅ Security: All logic server-side, API keys protected  

## Step 1: Deploy Supabase Edge Function

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Create Edge Function**
   ```bash
   supabase functions new chatbot-query
   ```

3. **Replace function code**
   - Open: `supabase/functions/chatbot-query/index.ts`
   - Copy the code from `supabase-edge-function.js` into this file
   - Note: Convert JavaScript to TypeScript (minimal changes needed)

4. **Deploy**
   ```bash
   supabase functions deploy chatbot-query
   ```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project → **Functions**
2. Click **Create a new function** → Name: `chatbot-query`
3. Choose **TypeScript** template
4. Replace the code with the Edge Function code from `supabase-edge-function.js`
5. Click **Deploy**

## Step 2: Verify Supabase Configuration

Ensure your `supabase-config.js` has:
```javascript
const SUPABASE_URL = 'your_project_url';
const SUPABASE_ANON_KEY = 'your_anon_key';
```

## Step 3: Add Chatbot to Dashboard

The chatbot is already integrated in `dashboard.html`:

```html
<!-- In dashboard.html, before closing </body> -->
<script src="chatbot-handler.js"></script>
```

## Step 4: Test the Chatbot

1. **Open dashboard.html** in your browser
2. **Look for the floating button** in the bottom-right corner (green chat icon)
3. **Click to open the chatbot**
4. **Try sample queries:**
   - "Show appointments next week"
   - "Who is on ART?"
   - "High viral load patients"
   - "New patients this month"
   - "Critical patients"

## Supported Query Patterns

### Appointments
- "Show appointments"
- "Appointments next week"
- "Appointments today"
- "Upcoming appointments"

### ART (Antiretroviral Therapy)
- "Patients on ART"
- "Who is receiving ART?"
- "ART treatment"

### Viral Load
- "High viral load"
- "Patients with viral > 1000"
- "Undetectable viral load"
- "U=U patients"

### Patient Status
- "New patients"
- "New registrations this month"
- "Critical patients"
- "Inactive patients"
- "Lost to follow-up"

### CD4 Count
- "Low CD4 patients"
- "CD4 count below 200"
- "CD4 results"

### General
- "Patient status"
- "How many patients by status?"

## Customization

### Add New Query Patterns

Edit `supabase-edge-function.js`:

```javascript
const QUERY_PATTERNS = {
  'my_new_query': {
    keywords: ['keyword1', 'keyword2', 'pattern.*regex'],
    handler: 'getMyCustomData'
  }
}

async function getMyCustomData(facilityId, query) {
  const { data, error } = await supabase
    .from('your_table')
    .select('col1, col2, col3')
    .eq('fid', facilityId)
    .limit(20)

  return {
    type: 'table',
    columns: ['Column 1', 'Column 2', 'Column 3'],
    data: data.map(row => ({
      'Column 1': row.col1,
      'Column 2': row.col2,
      'Column 3': row.col3
    }))
  }
}
```

### Styling Changes

Edit the CSS in `chatbot-handler.js` (in the `addChatbotStyles()` method):

```javascript
// Change primary color
background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR_DARK 100%);

// Change width/height
width: 420px;
height: 600px;
```

## Mobile Responsive

The chatbot automatically adapts:
- **Desktop**: Fixed position, 420px wide
- **Mobile**: Full-width, 70vh height
- **Animations**: Slide-in from bottom on mobile

## Security Considerations

1. **Facility Filtering**: Every query checks `facility_id` (RLS enforced)
2. **Server-Side Logic**: Pattern matching happens on server, not exposed to frontend
3. **No API Keys**: Database credentials never sent to client
4. **Input Validation**: All inputs validated in Edge Function

## Troubleshooting

### Chatbot button not showing
- Check browser console for errors
- Verify `chatbot-handler.js` is loaded: F12 → Network tab
- Check that Supabase config is valid

### Edge Function returning errors
- Verify function is deployed: `supabase functions list`
- Check function logs: Supabase Dashboard → Functions → chatbot-query → Logs
- Ensure `facility_id` is being passed correctly

### No data returned
- Verify facility has data in database
- Check that `fid` column exists in `patients` table
- Confirm user session has correct `facility_id`

### CORS errors
- Ensure Supabase project has CORS enabled for your domain
- Edge Function includes correct CORS headers

## Future Enhancements

1. **AI Integration**: Replace pattern matching with Gemini/OpenAI for NLP
2. **Conversation Context**: Remember previous queries in same session
3. **Export Results**: Download table results as CSV
4. **Analytics**: Track common queries to improve patterns
5. **Multi-language**: Support Luganda/Swahili responses
6. **Voice Input**: Speech-to-text queries

## Files Reference

| File | Purpose |
|------|---------|
| `chatbot-handler.js` | Frontend chatbot UI & interactions |
| `supabase-edge-function.js` | Backend query logic & patterns |
| `dashboard.html` | Modified to include chatbot |
| `CHATBOT_SETUP_GUIDE.md` | This file |

## Support

For issues:
1. Check browser console (F12) for error messages
2. Check Supabase function logs
3. Verify database RLS policies allow queries
4. Test with sample data if available

---

**Status**: Ready to deploy  
**Technology**: Vanilla JS + Supabase Edge Functions  
**Hosting**: GitHub Pages (frontend) + Supabase (backend)
