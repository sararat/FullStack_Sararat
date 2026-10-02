import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET || "hr_secret";

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());


// =====================
// JWT
// =====================

function auth(req, res, next) {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({
      message: "กรุณาเข้าสู่ระบบ"
    });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({
      message: "Token ไม่ถูกต้อง"
    });
  }
}


// ตรวจสอบ Role
function role(name) {

  return (req, res, next) => {

    if (req.user.role !== name)
      return res.status(403).json({
        message: "ไม่มีสิทธิ์"
      });

    next();
  };
}


// =====================
// TEST
// =====================

app.get("/", (req, res) => {
  res.json({
    message: "HRsystem API"
  });
});


// =====================
// LOGIN
// =====================

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({
      message: "กรุณากรอกข้อมูล"
    });

  try {

    const [rows] = await db.promise().query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    if (!rows.length)
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });

    const user = rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid)
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "เกิดข้อผิดพลาด"
    });
  }
});


// =====================
// USERS
// =====================

app.get(
  "/users",
  auth,
  role("personnel"),
  async (req, res) => {

    try {

      const [rows] = await db.promise().query(
        `SELECT id, fname, lname, username, role
         FROM users`
      );

      res.json(rows);

    } catch {

      res.status(500).json({
        message: "โหลดข้อมูลไม่สำเร็จ"
      });
    }
  }
);


// =====================
// EVALUATOR
// =====================

app.get(
  "/api/evaluator/assignments",
  auth,
  role("evaluator"),
  async (req, res) => {

    try {

      const [rows] = await db.promise().query(
        `SELECT
          a.id,
          e.name,
          d.name AS department,
          p.name AS period,
          a.status
        FROM assignments a
        JOIN employees e
          ON a.employee_id = e.id
        LEFT JOIN departments d
          ON e.department_id = d.id
        JOIN evaluation_periods p
          ON a.period_id = p.id
        WHERE a.evaluator_id = ?
        ORDER BY a.id DESC`,
        [req.user.id]
      );

      res.json({
        data: rows
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "โหลดข้อมูลไม่สำเร็จ"
      });
    }
  }
);

app.get("/api/evaluatee/assignments", async (req, res) => {

  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM assignments"
    );

    res.json({
      data: rows
    });

  } catch (error) {

    console.error("ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});
// =====================
// START SERVER
// =====================

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});