# HealthFlow Contact Form - Field Documentation

## Form Overview

The contact form is now a **Demo Request Form** with fields specifically designed to capture detailed facility information and demo preferences for healthcare professionals.

## Form Fields

### 1. Full Name
- **Field ID:** `fullName`
- **Type:** Text Input
- **Required:** Yes
- **Validation:** Non-empty string
- **Placeholder:** "e.g., Dr. James Mukasa"
- **Description:** Contact person's full name

### 2. Email Address
- **Field ID:** `email`
- **Type:** Email Input
- **Required:** Yes
- **Validation:** Valid email format
- **Placeholder:** "your.email@facility.com"
- **Description:** Contact person's email address for confirmation

### 3. Phone Number
- **Field ID:** `phone`
- **Type:** Tel Input
- **Required:** Yes
- **Validation:** Non-empty string
- **Placeholder:** "+256 (0) 701 234 567"
- **Description:** Contact person's phone number (preferably with country code)

### 4. Facility Name & District
- **Field ID:** `facilityName`
- **Type:** Text Input
- **Required:** Yes
- **Validation:** Non-empty string
- **Placeholder:** "e.g., Mbarara Regional Referral Hospital"
- **Description:** Official name and district of the healthcare facility

### 5. Facility Type
- **Field ID:** `facilityType`
- **Type:** Select Dropdown
- **Required:** Yes
- **Options:**
  - `public-hospital` - Public Hospital
  - `private-clinic` - Private Clinic
  - `ngo-clinic` - NGO Clinic
  - `district-health` - District Health Office
  - `referral` - Referral Center
  - `other` - Other
- **Description:** Type/classification of the facility

### 6. Average Monthly Patient Load
- **Field ID:** `patientLoad`
- **Type:** Select Dropdown
- **Required:** Yes
- **Options:**
  - `0-100` - 0-100 patients
  - `101-500` - 101-500 patients
  - `501-1000` - 501-1,000 patients
  - `1001-5000` - 1,001-5,000 patients
  - `5000+` - 5,000+ patients
- **Description:** Average number of patients served monthly by the facility

### 7. Preferred Demo Date
- **Field ID:** `demoDate`
- **Type:** Date Input
- **Required:** Yes
- **Format:** YYYY-MM-DD
- **Description:** Date when the facility representative wants to see the demo

### 8. Preferred Time
- **Field ID:** `preferredTime`
- **Type:** Select Dropdown
- **Required:** Yes
- **Options:**
  - `09:00` - 9:00 AM
  - `10:00` - 10:00 AM
  - `11:00` - 11:00 AM
  - `14:00` - 2:00 PM
  - `15:00` - 3:00 PM
  - `16:00` - 4:00 PM
- **Timezone:** EAT (East Africa Time)
- **Description:** Preferred time slot for the demo call/meeting

### 9. Areas of Interest
- **Field ID:** `interests`
- **Type:** Checkboxes (Multiple Selection)
- **Required:** Yes (At least one)
- **Options:**
  - `hiv` - HIV Patient Management
  - `chronic` - Chronic Disease Tracking
  - `maternal` - Maternal Health (PMTCT)
  - `adherence` - Medication Adherence
  - `appointments` - Appointment Management
- **Validation:** At least one checkbox must be selected
- **Description:** Which platform modules the facility is interested in

## Data Submission

### Submission Format
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "facilityName": "string",
  "facilityType": "string",
  "patientLoad": "string",
  "demoDate": "YYYY-MM-DD",
  "preferredTime": "HH:MM",
  "interests": ["string"],
  "timestamp": "ISO-8601 datetime",
  "source": "demo-request-form",
  "userAgent": "string"
}
```

### Example Submission
```json
{
  "fullName": "Dr. Sarah Namukasa",
  "email": "sarah.namukasa@mbararahospital.ug",
  "phone": "+256701234567",
  "facilityName": "Mbarara Regional Referral Hospital",
  "facilityType": "public-hospital",
  "patientLoad": "1001-5000",
  "demoDate": "2026-02-15",
  "preferredTime": "10:00",
  "interests": ["hiv", "maternal", "adherence"],
  "timestamp": "2026-01-30T10:30:00.000Z",
  "source": "demo-request-form",
  "userAgent": "Mozilla/5.0..."
}
```

## Backend Integration

### Endpoint Configuration
- **Default Endpoint:** `/api/demo-requests`
- **Method:** POST
- **Content-Type:** application/json

### Update Instructions
Replace the endpoint in `landing-sections.js`:
```javascript
const endpoint = '/api/demo-requests'; // Line 90 in landing-sections.js
```

### Success Response
The system expects a JSON response:
```json
{
  "success": true,
  "message": "Demo request received",
  "demoId": "unique-identifier"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

## Frontend Validation

### Client-Side Validation
1. **Required Fields:** All fields except message
2. **Email Validation:** Must be valid email format
3. **Phone Validation:** Non-empty string
4. **Interests Validation:** At least one checkbox selected
5. **Date Validation:** Must be a future date
6. **Time Validation:** Must select one of available slots

### Error Messages
- Full Name: "Name is required"
- Email: "Valid email is required"
- Phone: "Phone number is required"
- Facility Name: "Facility name is required"
- Facility Type: "Please select a facility type"
- Patient Load: "Please select patient load range"
- Demo Date: "Please select a date"
- Preferred Time: "Please select a time"
- Interests: "Please select at least one area of interest"

## Success Message

After successful submission:
```
"Demo Scheduled!"

Thank you, [fullName]!
We've received your demo request for [demoDate] at [preferredTime]
You'll receive a confirmation email and WhatsApp message shortly.
```

## Data Handling Notes

1. **Phone Number Format:** International format recommended (+256 for Uganda)
2. **Demo Date:** Only accepts future dates
3. **Timezone:** All times are in EAT (East Africa Time)
4. **Interests:** Multiple selections are allowed and encouraged
5. **Timestamp:** Automatically captured server-side
6. **User Agent:** For tracking device/browser information

## Compliance & Security

- All data is collected with explicit consent
- Patient Load is aggregated data (no specific patient names)
- Phone numbers can be used for WhatsApp follow-up
- Emails will be added to demo confirmation list
- All data should be handled per healthcare privacy regulations

## Follow-up Workflow

After successful submission:
1. Confirmation email sent to the provided email address
2. WhatsApp message sent to the phone number with demo details
3. Calendar invitation sent (if using calendar integration)
4. CRM record created for facility
5. Demo scheduled and added to internal calendar

## Testing Form

### Test Case 1: Valid Submission
```
- Full Name: Dr. James Mukasa
- Email: james@test.ug
- Phone: +256701234567
- Facility: Mbarara Hospital
- Type: Public Hospital
- Patient Load: 1001-5000
- Date: 2026-02-15
- Time: 10:00
- Interests: HIV, Maternal
- Expected: Success message
```

### Test Case 2: Missing Interest Selection
```
- All fields filled correctly
- NO interests selected
- Expected: Error "Please select at least one area of interest"
```

### Test Case 3: Invalid Email
```
- Email: "invalid-email"
- Expected: Error "Valid email is required"
```

## Related Files

- `index.html` - Form HTML structure
- `landing-sections.js` - Form handling and submission logic
- `landing-sections.css` - Form styling and responsive design
