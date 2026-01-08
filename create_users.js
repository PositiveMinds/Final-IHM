// Script to create sample users with hashed passwords
// Run with: node create_users.js

const bcrypt = require('bcryptjs');

// Sample users data
const sampleUsers = [
  {
    email: 'demo@facility.com',
    password: 'Demo123!',
    facility_name: 'Demo Facility',
    facility_id: 'facility-001',
    user_role: 'Administrator'
  },
  {
    email: 'admin@kampala.ug',
    password: 'Password123!',
    facility_name: 'Kampala Medical Centre',
    facility_id: 'facility-kampala-001',
    user_role: 'Administrator'
  },
  {
    email: 'manager@mbarara.ug',
    password: 'Password123!',
    facility_name: 'Mbarara Regional Hospital',
    facility_id: 'facility-mbarara-001',
    user_role: 'Manager'
  },
  {
    email: 'staff@gulu.ug',
    password: 'Password123!',
    facility_name: 'Gulu Health Center',
    facility_id: 'facility-gulu-001',
    user_role: 'Staff'
  },
  {
    email: 'director@jinja.ug',
    password: 'Password123!',
    facility_name: 'Jinja District Hospital',
    facility_id: 'facility-jinja-001',
    user_role: 'Administrator'
  }
];

// Hash passwords and generate SQL
async function generateSQL() {
  console.log('-- Generated SQL for Sample Users\n');
  console.log('INSERT INTO users (email, password_hash, facility_name, facility_id, user_role, is_active)');
  console.log('VALUES');
  
  const sqlLines = [];
  
  for (let i = 0; i < sampleUsers.length; i++) {
    const user = sampleUsers[i];
    const hash = await bcrypt.hash(user.password, 10);
    
    const sqlLine = `  ('${user.email}', '${hash}', '${user.facility_name}', '${user.facility_id}', '${user.user_role}', true)`;
    sqlLines.push(sqlLine);
    
    console.log(`\n-- User ${i + 1}: ${user.email}`);
    console.log(`-- Password: ${user.password}`);
  }
  
  console.log('\n' + sqlLines.join(',\n'));
  console.log('\nON CONFLICT (email) DO NOTHING;');
}

generateSQL().catch(console.error);
