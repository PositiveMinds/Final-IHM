-- Check what roles currently exist in users table
SELECT DISTINCT user_role, COUNT(*) 
FROM users 
GROUP BY user_role;
