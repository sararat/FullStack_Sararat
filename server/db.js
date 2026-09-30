import mysql from 'mysql2';

const db = mysql.createPool({
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'hrsystem',
  port: 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }

  console.log('Database connected successfully');

  connection.release();
});

export default db;