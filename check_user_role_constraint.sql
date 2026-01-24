-- Check the constraint definition
SELECT constraint_name, constraint_definition 
FROM information_schema.table_constraints t
JOIN information_schema.check_constraints c ON t.constraint_name = c.constraint_name
WHERE t.table_name = 'users' AND constraint_name LIKE '%role%';

-- Or check check constraint definition
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'ck_users_valid_role';
