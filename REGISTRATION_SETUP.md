# User Registration Setup Guide

## Files Created

1. **register.html** - Beautiful registration page with form validation
2. **register.js** - Registration logic with Supabase integration
3. **Updated login.html** - Added link to registration page

## Features

### Registration Form
- ✅ Email validation
- ✅ Facility name input
- ✅ Facility ID (unique identifier)
- ✅ User role selection (Administrator, Manager, Staff)
- ✅ Password with strength indicator
- ✅ Password confirmation
- ✅ Terms and Conditions acceptance
- ✅ Privacy Policy link

### Password Strength Checker
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

Strength levels:
- 🔴 Weak (0-2 requirements met)
- 🟡 Fair (3 requirements met)
- 🟢 Strong (4+ requirements met)

### Validation
- Duplicate email prevention
- Duplicate facility ID prevention
- Password match verification
- Terms acceptance required
- Real-time password strength feedback

## How It Works

1. User fills in registration form
2. Client-side validation checks all fields
3. Password strength is verified
4. Form checks for duplicate email/facility ID in Supabase
5. Password is hashed (client-side for demo, should be server-side in production)
6. New user record is inserted into `users` table
7. User is redirected to login page

## Accessing Registration

**Option 1:** Direct URL
```
http://localhost:8000/register.html
```

**Option 2:** From Login Page
Click "Create New Account" link

**Option 3:** From Home Page
Update index.html to add registration link:
```html
<a href="register.html" class="btn btn-success ms-2">Sign Up</a>
```

## Testing Registration

1. Open `register.html`
2. Fill in the form:
   - Email: `testfacility@gmail.com`
   - Facility Name: `Test Health Center`
   - Facility ID: `facility-test-001`
   - Role: `Administrator`
   - Password: `SecurePass123!`
   - Confirm: `SecurePass123!`
3. Accept terms
4. Click "Create Account"
5. Should see success message
6. Should be redirected to login page
7. Login with new credentials

## Sample Registration Data

For testing, you can register:

| Email | Facility | ID | Role | Password |
|-------|----------|----|----|----------|
| clinic1@kampala.ug | Kampala Clinic | facility-kampala-clinic | Manager | SecurePass123! |
| hospital1@mbarara.ug | Mbarara Hospital | facility-mbarara-hosp | Administrator | SecurePass123! |
| health1@gulu.ug | Gulu Health Center | facility-gulu-hc | Staff | SecurePass123! |

## Security Considerations ⚠️

### Current Implementation (Demo)
- Password hashing is client-side only
- Simple string comparison in login

### Production Implementation Should Include
1. **Server-side password hashing** using bcryptjs or similar
2. **HTTPS only** for all credentials transmission
3. **Email verification** before account activation
4. **Rate limiting** on registration attempts
5. **CAPTCHA** to prevent automated registration
6. **Audit logging** of all registration attempts
7. **Two-factor authentication** for administrators

## Updating Registration Link in Navigation

To add registration link to your home page (index.html):

```html
<!-- Add to navbar -->
<li class="nav-item">
    <a class="btn btn-success ms-2" href="register.html">
        <i class="fas fa-user-plus me-2"></i>Sign Up
    </a>
</li>
```

## Next Steps

1. ✅ Test registration with sample data
2. ✅ Verify new users appear in Supabase dashboard
3. ✅ Test login with newly registered accounts
4. ✅ Implement email verification (optional)
5. ✅ Add password reset functionality
6. ✅ Implement dashboard session checks

## Troubleshooting

**Registration fails with "Email already exists":**
- Email is already registered
- Use a different email address

**"Facility ID already exists":**
- Facility ID must be unique
- Use a different ID

**Password validation fails:**
- Ensure password meets all strength requirements:
  - 8+ characters
  - 1 uppercase letter
  - 1 number
  - 1 special character (e.g., !@#$%^&*)

**Form not submitting:**
- Check browser console for JavaScript errors
- Verify Supabase credentials in `supabase-config.js`
- Ensure `users` table exists in Supabase

## Password Reset Functionality

To add password reset later, create:
- `forgot-password.html` - Reset request form
- `reset-password.html` - New password entry
- `forgot-password.js` - Reset logic

This will send reset links via email (requires email service integration).
