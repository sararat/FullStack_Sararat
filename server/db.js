import mysql from "mysql2";

const db = mysql.createPool({

  host: process.env.DB_HOST || "mysql",

  user: process.env.DB_USER || "root",

  password: process.env.DB_PASSWORD || "root",

  database: process.env.DB_NAME || "hrsystem",

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0

});

export default db;