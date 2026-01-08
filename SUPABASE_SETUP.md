# Supabase Login Setup Guide

## Configuration Complete ✅

Your HealthFlow app is now configured to use Supabase authentication.

### Files Created/Updated

1. **supabase-config.js** - Contains your Supabase credentials
   - Project URL: `https://db.tnhbrekxxlenmziyefwx.supabase.co`
   - Anon Key: Configured

2. **login.html** - Updated to include Supabase JS library

3. **login.js** - Updated with Supabase authentication logic

## Next Steps

### 1. Create the Users Table in Supabase

Go to your Supabase dashboard → SQL Editor and run:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  facility_id TEXT UNIQUE NOT NULL,
  user_role TEXT DEFAULT 'Administrator',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 2. Insert Sample Users

Use the SQL script to insert sample users with hashed passwords:

```sql
-- Insert the sample users from insert_sample_users.sql
-- Or import from Sample_Login_Credentials.csv
```

Sample credentials:
- Email: `demo@facility.com` | Password: `Demo123!`
- Email: `admin@kampala.ug` | Password: `Password123!`
- Email: `manager@mbarara.ug` | Password: `Password123!`
- Email: `staff@gulu.ug` | Password: `Password123!`
- Email: `director@jinja.ug` | Password: `Password123!`

### 3. Enable Row Level Security (RLS)

In Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. Create a policy to allow users to read their own data:

```sql
CREATE POLICY "Users can read their own data" 
ON users 
FOR SELECT 
USING (auth.uid() = id);
```

### 4. Install bcryptjs for Production (Optional)

For secure password hashing in production:

```bash
npm install bcryptjs
```

Then update `login.js` to uncomment the bcrypt comparison code.

## How It Works

1. User enters email and password in login form
2. App queries Supabase `users` table for matching email
3. Password is compared (currently simple comparison - should use bcrypt in production)
4. If valid, user session is stored in sessionStorage
5. User is redirected to dashboard.html

## Security Notes ⚠️

- **Current Setup**: Uses simple string password comparison (for demo)
- **Production**: Must implement bcryptjs password hashing
- **Credentials**: Keep `supabase-config.js` secure - don't commit to public repos
- **HTTPS**: Deploy with HTTPS to protect login data

## Testing

1. Open `login.html` in your browser
2. Use sample credentials from above
3. Check browser console for any errors
4. Verify session data in sessionStorage after successful login

## Troubleshooting

**Login fails with "Invalid email or password":**
- Check that users table exists in Supabase
- Verify sample data was inserted correctly
- Check browser console for detailed errors

**CORS errors:**
- Ensure your Supabase project allows your domain
- In Supabase dashboard: Settings → API → CORS settings

**Supabase client not found:**
- Clear browser cache
- Check that `supabase-config.js` is loaded after Supabase JS library

## Next: Dashboard Integration

Once login works, update `dashboard.html` to:
1. Check for valid session
2. Retrieve user data from sessionStorage
3. Implement logout functionality
4. Load facility-specific data from Supabase
