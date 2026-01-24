# Patient Portal Setup Instructions

## Overview
The Patient Portal allows patients to log in and access their health information, appointments, and messages.

## Setup

### 1. Configure Supabase Credentials

The patient portal requires Supabase configuration to connect to your database.

**Steps:**

1. Copy the template file:
   ```bash
   cp supabase-patient-config.example.js supabase-patient-config.js
   ```

2. Open `supabase-patient-config.js` and add your credentials:
   ```javascript
   const SUPABASE_CONFIG = {
       URL: 'https://your-project-id.supabase.co',
       KEY: 'your-anon-key-here'
   };
   ```

3. Get your credentials from Supabase:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Click **Settings → API**
   - Copy:
     - **Project URL** → paste into `URL`
     - **anon/public key** → paste into `KEY`

### 2. Access the Patient Portal

Open `patient-portal.html` in your browser.

### 3. Login

Patients can log in with:
- **Username:** Auto-generated from their name (e.g., @johndoe123)
- **Password:** Set when their account was created

## Important Notes

⚠️ **Security:**
- `supabase-patient-config.js` is listed in `.gitignore`
- Never commit this file to GitHub
- Keep your API keys confidential

## Features

✓ Patient login with username/password
✓ View personal health information
✓ View upcoming appointments
✓ Access medical history
✓ Chat with healthcare providers
✓ Responsive mobile design

## Database Requirements

The patient portal requires the following tables:
- `users` (with patient role)
- `patients`
- `appointments`
- `chats`
- `messages`

## Troubleshooting

**"Supabase not found" error:**
- Ensure `supabase-patient-config.js` exists in the same directory as `patient-portal.html`
- Check that your URL and KEY are correct

**"Invalid credentials" error:**
- Verify your Supabase URL and API key
- Check that the user exists in the database with role='patient'

**Messages not loading:**
- Ensure a chat exists for the patient (linked via `patient_pid`)
- Check that messages table has data for that chat
