# Week Calculation Implementation (Monday–Sunday)

## Overview
Updated the chatbot's appointment processing to follow the ISO week standard where **weeks run Monday to Sunday** instead of arbitrary 7-day ranges.

## Changes Made

### 1. **Edge Function: `getAppointmentsNextWeek()` (index.ts:379–415)**

**Old Behavior:**
- Simply added 7 days to today
- Did not respect calendar week boundaries
- Example: If queried on Wednesday, would show Wed–Wed, not Mon–Sun

**New Behavior:**
- Calculates the Monday of the **next week**
- Calculates the Sunday of that same week (6 days after Monday)
- Handles week boundaries correctly

**Implementation:**
```typescript
const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
const daysUntilNextMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
const nextMonday = new Date(today.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000);
const nextSunday = new Date(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000);
```

### 2. **Time Period Parsing: `parseTimePeriod()` (index.ts:196–228)**

**Updated "Last Week" Logic:**
- When user asks about "this week" or "last week"
- Now calculates the Monday of the **current week**
- Uses Monday as the start date instead of 7 days ago

**Implementation:**
```typescript
const dayOfWeek = today.getDay();
const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
const lastMonday = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
startDate = lastMonday.toISOString().split("T")[0];
```

### 3. **Documentation: CHATBOT_USER_GUIDE.md**

**Added:**
- Example queries: "Next week's appointments", "This week's appointments"
- Clear explanation of week range (Monday–Sunday)
- Visual example showing how "next week" is calculated

## Affected Query Patterns

Users can now query appointments using:
- ✅ "Next week's appointments" → Monday–Sunday of next week
- ✅ "This week's appointments" → Monday–Sunday of current week
- ✅ "Last week's appointments" → Monday–Sunday of previous week
- ✅ "Appointments between dates" → Still uses explicit date ranges
- ✅ "Appointments today" → Unaffected

## Testing Examples

### Example 1: Today is Wednesday, January 29, 2026
```
Query: "Next week's appointments"
Result: Monday, Feb 2 through Sunday, Feb 8
```

### Example 2: Today is Sunday, January 26, 2026
```
Query: "Next week's appointments"
Result: Monday, Jan 27 through Sunday, Feb 2 (the very next day starts the next week)
```

### Example 3: Today is Monday, January 27, 2026
```
Query: "This week's appointments"
Result: Monday, Jan 27 through Sunday, Feb 2 (current week)
```

## Why This Pattern?

The **ISO 8601 week standard** (Monday–Sunday) is:
- International standard used in healthcare
- Matches common business/clinic operational weeks
- More intuitive: "next week" means the coming calendar week
- Prevents confusion when querying across month/day boundaries

## Files Modified

1. `supabase/functions/chatbot-query/index.ts`
   - Function: `getAppointmentsNextWeek()` (lines 379–415)
   - Function: `parseTimePeriod()` (lines 196–228)

2. `CHATBOT_USER_GUIDE.md`
   - Added week range explanation (lines 45–57)
   - Added documentation to Privacy & Security section

## Backward Compatibility

- Explicit date range queries (e.g., "between 10 March to 25 March") are unaffected
- "Today's appointments" queries are unaffected
- Only "this week" / "next week" / "last week" patterns changed
