# Critical Patients Query - Test Scenarios

## Test Environment Setup
- User logged in with valid session
- Session contains `fid` (facility ID)
- Patients table has data with `last_viral_load` and `last_cd4_count`
- Supabase Edge Function deployed and accessible

## Test Scenarios

### Scenario 1: Basic Critical Patient Count
**User Query**: "How many critical patients do we have?"

**Expected Behavior**:
1. Chatbot detects "high_risk" intent
2. Calls `callBackendHandler("getCriticalPatients")`
3. Backend filters patients by:
   - VL >= 1000 OR
   - CD4 < 50 OR
   - Conditions contain HTN/Diabetes
4. Returns table with matching patients

**Expected Response**:
```
🚨 2 critical patient(s) require immediate attention (VL≥1000 or CD4<50 or HTN/DM)

[Table with patients meeting critical criteria]
Showing 2 of 5 records
```

**Success Criteria**:
- ✓ Alert banner shows with 🚨 icon
- ✓ Correct count of critical patients displayed
- ✓ Table headers are visible
- ✓ Patient data rows are populated
- ✓ Viral load shows 🔴 for VL >= 1000
- ✓ CD4 shows 🔴 for CD4 < 50
- ✓ Pagination info shows

### Scenario 2: No Critical Patients
**User Query**: "Show critical patients"

**Setup**: Database has no patients matching critical criteria

**Expected Response**:
```
No critical patients at this time.
[Follow-up suggestions]
```

**Success Criteria**:
- ✓ No error message
- ✓ Friendly message displayed
- ✓ Chatbot remains responsive
- ✓ User can ask follow-up questions

### Scenario 3: Multiple Critical Patients with Pagination
**User Query**: "Critical patients needing attention"

**Setup**: Database has 75 patients meeting critical criteria

**Expected Behavior**:
1. Backend returns first 50 patients (default limit)
2. Pagination info shows: "Showing 50 of 75 records (Page 1)"
3. User can request more results

**Success Criteria**:
- ✓ Pagination info visible
- ✓ Correct record count displayed
- ✓ Table shows up to 50 rows
- ✓ User can request more

### Scenario 4: Facility-Specific Filtering
**User Query**: "How many critical patients do we have?"

**Setup**: 
- User A (Facility X) - 3 critical patients
- User B (Facility Y) - 7 critical patients

**Expected Behavior**:
- User A sees 3 critical patients
- User B sees 7 critical patients
- No cross-facility data leakage

**Success Criteria**:
- ✓ Facility ID correctly retrieved from session
- ✓ Only facility's patients displayed
- ✓ Results differ per user

### Scenario 5: Critical Patient Details
**User Query**: "How many critical patients do we have?"

**Expected Table Columns**:
1. Patient ID (e.g., PAT0001)
2. Name (patient name)
3. Viral Load (e.g., "2500 🔴" or "Suppressed")
4. CD4 (e.g., "45 🔴" or "200")
5. Conditions (e.g., "HIV", "HIV, Hypertension")
6. Next Appointment (date or "None scheduled")

**Success Criteria**:
- ✓ All columns present
- ✓ Data properly formatted
- ✓ 🔴 emoji shows for critical values
- ✓ "Suppressed" shows for VL <= 50
- ✓ Dates properly formatted

### Scenario 6: Various Query Phrasings
Test these queries - all should work:
- "How many critical patients do we have?"
- "Show critical patients"
- "Critical patients"
- "List critical patients"
- "Find critical patients"
- "Show alert patients"
- "Alert patients"
- "Urgent patients"
- "Show me critical patients"
- "Tell me about critical patients"

**Expected**: All return same results (critical patients meeting criteria)

**Success Criteria**:
- ✓ Intent detection works for all variations
- ✓ All return similar results
- ✓ Consistent formatting

### Scenario 7: Error Handling - Missing Facility ID
**Setup**: Session missing `fid` or `facility_id`

**Expected Behavior**:
1. Fallback to "default-facility"
2. Either return results for default facility OR
3. Return error message "Facility not found"

**Success Criteria**:
- ✓ Graceful handling (no crash)
- ✓ Error message is clear
- ✓ User knows to log in

### Scenario 8: Error Handling - Database Connection
**Setup**: Supabase connection fails

**Expected Response**:
```
Error retrieving high-risk patients: [error message]
```

**Success Criteria**:
- ✓ Error message displayed
- ✓ No generic "Server Error"
- ✓ User can retry

### Scenario 9: Browser Compatibility
Test on:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers

**Expected**: Same behavior on all browsers

**Success Criteria**:
- ✓ Works on desktop browsers
- ✓ Works on mobile browsers
- ✓ Responsive table display
- ✓ No console errors

### Scenario 10: Performance - Large Dataset
**Setup**: 1000+ patients in facility, 200 are critical

**Expected Behavior**:
1. Query returns in < 2 seconds
2. Table displays smoothly
3. Pagination handles 200 records
4. Browser doesn't freeze

**Success Criteria**:
- ✓ Response time acceptable
- ✓ No UI freezing
- ✓ Table scrolls smoothly
- ✓ Pagination works with large count

## Manual Testing Checklist

```
□ Test basic query "How many critical patients do we have?"
□ Verify alert banner displays with correct count
□ Check table headers present
□ Verify patient data populated
□ Check 🔴 emoji shows for critical values
□ Test pagination information
□ Test facility-specific filtering
□ Test when no critical patients exist
□ Test various query phrasings
□ Check browser console for errors
□ Test on mobile device
□ Verify appointment dates format correctly
□ Test logout/login preserves session
□ Test with different user accounts
□ Verify follow-up suggestion links work
```

## Automated Testing (if applicable)

```javascript
// Test 1: Handler is registered
expect(HANDLERS["getCriticalPatients"]).toBeDefined();

// Test 2: Intent detection
expect(chatbot.detectIntent("how many critical patients")).toBe("high_risk");

// Test 3: Backend call
const result = await chatbot.callBackendHandler("getCriticalPatients", {});
expect(result.type).toBe("table");
expect(result.columns).toBeDefined();
expect(Array.isArray(result.data)).toBe(true);

// Test 4: Response formatting
const html = chatbot.formatTableResponse(result);
expect(html).toContain("<table");
expect(html).toContain("</table>");
```

## Success Criteria Summary

The fix is successful when:
1. ✓ Query "How many critical patients?" returns data
2. ✓ Critical patients identified by clinical criteria (VL, CD4, conditions)
3. ✓ Results displayed in formatted table
4. ✓ Alert banner shows with critical count
5. ✓ Facility-specific filtering works
6. ✓ No JavaScript errors in console
7. ✓ Works on all supported browsers
8. ✓ Handles errors gracefully
9. ✓ Response time < 2 seconds
10. ✓ All related queries work (alert, urgent, critical)
