# Chatbot Database Retrieval - Testing Checklist

## Pre-Testing Requirements

- [ ] Browser with developer tools access (F12)
- [ ] Access to dashboard.html
- [ ] Network connection to Supabase servers
- [ ] Patient data loaded in the `patients` table

## Step 1: Verify Supabase Connection

1. Open `dashboard.html` in a browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for these messages:
   ```
   Supabase client initialized
   Supabase client already initialized
   ```
5. If you see either message, connection is working ✓

## Step 2: Verify Chatbot Loads

1. Look for a chatbot button (💬) in the bottom right corner
2. Click it to open the chatbot
3. You should see:
   - Welcome message
   - List of suggestion buttons
   - Database connection status

## Step 3: Test Intent Detection

Open the console (F12 → Console) and test each query. Watch the console for these logs:

### Test Patient Search
**Query:** "Show me all HIV positive patients"
- [ ] Console shows: `Detected intent: patient_search`
- [ ] Console shows extracted filters
- [ ] Chatbot returns patient list

**Query:** "List female patients with diabetes"
- [ ] Console shows: `Detected intent: patient_search`
- [ ] Chatbot returns results or "No patients found"

### Test Statistics
**Query:** "How many active patients do we have?"
- [ ] Console shows: `Detected intent: patient_stats`
- [ ] Chatbot shows statistics

### Test High-Risk Patients
**Query:** "Show critical patients"
- [ ] Console shows: `Detected intent: high_risk`
- [ ] Chatbot lists critical patients

### Test Viral Load
**Query:** "Show patients with detectable viral load"
- [ ] Console shows: `Detected intent: viral_load`
- [ ] Results displayed

### Test Appointments
**Query:** "Show upcoming appointments"
- [ ] Console shows: `Detected intent: appointments`
- [ ] Appointments listed (if any exist)

## Step 4: Test Filter Extraction

Open console and look for these logs when testing queries:

**Test Condition Filters:**
- Query "HIV patients" → Should extract `condition: 'HIV/AIDS'`
- Query "diabetes patients" → Should extract `condition: 'Diabetes'`
- Query "hypertension" → Should extract `condition: 'Hypertension'`
- Query "TB patients" → Should extract `condition: 'TB'`

**Test Status Filters:**
- Query "active patients" → Should extract `status: 'Active'`
- Query "inactive patients" → Should extract `status: 'Inactive'`
- Query "critical patients" → Should extract `status: 'Critical'`

**Test HIV Status:**
- Query "HIV positive patients" → Should extract `hiv_status: 'Positive'`
- Query "HIV negative patients" → Should extract `hiv_status: 'Negative'`

**Test Demographics:**
- Query "male patients" → Should extract `gender: 'M'`
- Query "female patients" → Should extract `gender: 'F'`
- Query "patients age 50" → Should extract `min_age: 50`

## Step 5: Error Handling Tests

### Test Database Connection Error
1. Edit `supabase-config.js` to use invalid credentials
2. Try a query
3. [ ] You should see an error message like:
   ```
   Error retrieving patient data: ... Please check the database connection.
   ```

### Test No Results
1. Query with very specific filters that match no patients
2. [ ] Chatbot should respond with helpful message

## Step 6: Edge Cases

**Test:**
- [ ] Empty query (send with no text) - should not crash
- [ ] Very long query - should process correctly
- [ ] Query with special characters - should handle gracefully
- [ ] Rapid successive queries - should queue properly
- [ ] Multiple filters in one query - should apply all filters

## Console Log Checklist

When a query is processed, you should see in the console:

```
✓ Intent check - [intent_name]: pattern=[bool], keyword=[bool]
✓ Intent matched: [intent_name]
✓ Detected intent: [intent_name]
✓ Extracted filters: {filter_object}
✓ Supabase client available, querying patients with filters:
✓ Query filters: {filter_object}
✓ Query results count: [number]
```

## Success Criteria

The chatbot is working correctly if:

- [x] Supabase client initializes without errors
- [x] Chatbot UI opens without errors
- [x] Intent detection works for all intent types
- [x] Filters are properly extracted from queries
- [x] Database queries return results or appropriate messages
- [x] Error handling works gracefully
- [x] Multiple filters can be applied in one query
- [x] Console logs show expected debug information

## Troubleshooting

### Issue: Chatbot button not visible
**Solution:**
1. Check browser console for errors loading chatbot-ui.js
2. Verify script tags in dashboard.html
3. Check chatbot CSS file is loading

### Issue: Supabase client not initialized
**Solution:**
1. Check if Supabase library script loads: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
2. Verify supabase-config.js loads after the library
3. Check browser console for errors

### Issue: Queries not returning results
**Solution:**
1. Check extracted filters in console log
2. Verify actual field values in Supabase database
3. Try simpler queries with fewer filters
4. Check database table structure matches code expectations

### Issue: Intent not detected correctly
**Solution:**
1. Check console logs for pattern and keyword match results
2. Review intent patterns in chatbot-ai.js
3. Verify query text and keywords match patterns
4. Check that filter extraction is working

## Performance Notes

- Initial chatbot load: Should be < 1 second
- Query response time: Should be < 2 seconds (depending on database size)
- Multiple queries: Should handle 5+ sequential queries smoothly

## Notes

- All console logs are prefixed with intent name or function name for easy filtering
- The chatbot maintains conversation history for context
- Database queries use Supabase limit(20) to prevent excessive data transfer
- Patient data is formatted as HTML tables for readability in chat
