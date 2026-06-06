import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'railway',
  port:     Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     30000,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ DATABASE CONNECTION FAILED:', err);
  });

export default pool;