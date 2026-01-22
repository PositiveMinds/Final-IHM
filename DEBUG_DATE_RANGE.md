# Debug Date Range Issue

## Steps to Debug

1. **Open dashboard.html** in your browser
2. **Open DevTools Console** (F12)
3. **Clear console** (Ctrl+L)
4. **Type in the chatbot:**
   ```
   Show appointments from January 15 to January 31
   ```
5. **Look at console output**

## What to Look For

You should see logs like:

```
DEBUG: Parsing custom date range: { startStr: 'january 15', endStr: 'january 31' }
DEBUG: parseFlexibleDate called with: january 15
DEBUG: Month-Day match: { monthStr: 'january', month: 0, day: 15, year: 2026 }
DEBUG: Created date: 2026-01-15T00:00:00.000Z
DEBUG: parseFlexibleDate called with: january 31
DEBUG: Month-Day match: { monthStr: 'january', month: 0, day: 31, year: 2026 }
DEBUG: Created date: 2026-01-31T00:00:00.000Z
DEBUG: Parsed dates: { 
  startStr: 'january 15', 
  startDate: '2026-01-15T00:00:00.000Z',
  endStr: 'january 31',
  endDate: '2026-01-31T00:00:00.000Z'
}
DEBUG: Appointment date filter applied:
  Start Date: 2026-01-15T00:00:00.000Z
  End Date: 2026-01-31T00:00:00.000Z
```

Then for each appointment:
```
DEBUG: Including appointment: {
  patientName: "...",
  apptDateRaw: "2026-01-20",
  apptDateNormalized: "2026-01-20T00:00:00.000Z",
  passesStart: true,
  endBoundary: "2026-02-01T00:00:00.000Z",
  passesEnd: true
}
```

Or if excluding:
```
DEBUG: Excluding appointment: {
  patientName: "...",
  apptDateRaw: "2026-02-05",
  apptDateNormalized: "2026-02-05T00:00:00.000Z",
  passesStart: true,
  endBoundary: "2026-02-01T00:00:00.000Z",
  passesEnd: false
}
```

## If February Appointments Are Still Showing

Please **paste the console output** here so we can see:
1. What dates are being extracted
2. What the appointment dates are
3. What the boundary calculation is
4. Why they're being included

## Possible Issues

1. **Wrong year being used** - If current date is in 2026 but appointments are in different year
2. **Database format issue** - Dates stored in wrong format in next_appointment field
3. **Timezone issue** - UTC vs Local time difference
4. **Regex not matching** - The date range not being extracted properly

We'll identify which one it is from the console logs.
