// db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function initDB() {
  // 1. Connect without specifying the database (so we can create it if missing)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 4078,
    ssl: { rejectUnauthorized: true } // SkySQL requires SSL
  });

  // 2. Create database if not exists
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  console.log(`Database "${process.env.DB_NAME}" checked/created`);

  // 3. Switch to the new database
  await connection.changeUser({ database: process.env.DB_NAME });

  // 4. Create table if not exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log(`Table "users" checked/created`);

  await connection.end();
}

// Create a pool for later queries
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4078,
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Run initialization when the app starts
initDB().catch(err => {
  console.error('Error initializing database:', err);
});

module.exports = pool;
