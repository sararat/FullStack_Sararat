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

app.get("/api/evaluation/:id", async (req, res) => {

  try {

    // 1. หา assignment
    const [assignments] = await db.promise().query(
      "SELECT * FROM assignments WHERE id = ?",
      [req.params.id]
    );

    if (assignments.length === 0) {

      return res.status(404).json({
        message: "ไม่พบแบบประเมิน"
      });

    }

    const assignment = assignments[0];


    // 2. หาหัวข้อของรอบนี้
    const [topics] = await db.promise().query(
      "SELECT * FROM evaluation_topics WHERE period_id = ?",
      [assignment.period_id]
    );


    // 3. หาตัวชี้วัด
    let indicators = [];

    for (const topic of topics) {

      const [rows] = await db.promise().query(
        "SELECT * FROM evaluation_indicators WHERE topic_id = ?",
        [topic.id]
      );

      indicators.push(
        ...rows.map(item => ({
          ...item,
          topic_name: topic.name
        }))
      );

    }


    // 4. ส่งข้อมูลกลับ Vue
    res.json({

      data: {

        id: assignment.id,

        name: assignment.evaluatee_name,

        department: assignment.department,

        period: assignment.period,

        indicators: indicators

      }

    });

  } catch (error) {

    console.error("EVALUATION ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

});

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