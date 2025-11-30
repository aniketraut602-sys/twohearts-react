const bcrypt = require('bcryptjs');
const { db } = require('../db/db');

const adminEmail = 'admin@example.com';
const adminPassword = 'password123'; // This should be a strong, randomly generated password

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    stmt.run(adminEmail, hashedPassword);

    console.log(`Seeded admin user with email: ${adminEmail}`);
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    db.close();
  }
}

seed();