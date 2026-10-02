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

  if (!username || !password) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูล"
    });
  }

  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      SECRET,
      {
        expiresIn: "8h"
      }
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

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "เกิดข้อผิดพลาด"
    });

  }

});


// =====================
// SIGNUP
// =====================

app.post("/signup", async (req, res) => {

  const {
    fname,
    lname,
    username,
    password,
    role
  } = req.body;

  if (
    !fname ||
    !lname ||
    !username ||
    !password ||
    !role
  ) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูลให้ครบ"
    });
  }

  const roles = [
    "personnel",
    "evaluator",
    "evaluatee"
  ];

  if (!roles.includes(role)) {
    return res.status(400).json({
      message: "Role ไม่ถูกต้อง"
    });
  }

  try {

    // ตรวจสอบ Username ซ้ำ
    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (users.length > 0) {
      return res.status(400).json({
        message: "Username นี้มีผู้ใช้งานแล้ว"
      });
    }

    // เข้ารหัส Password
    const hashPassword = await bcrypt.hash(
      password,
      10
    );

    // บันทึกข้อมูล
    await db.promise().query(
      `INSERT INTO users
      (fname, lname, username, password, role)
      VALUES (?, ?, ?, ?, ?)`,
      [
        fname,
        lname,
        username,
        hashPassword,
        role
      ]
    );

    res.json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว"
    });

  } catch (error) {

    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      message: "สมัครสมาชิกไม่สำเร็จ"
    });

  }

});


// =====================
// EVALUATEE ASSIGNMENTS
// =====================

app.get("/api/evaluatee/assignments", async (req, res) => {

  try {

    const [rows] = await db.promise().query(
      "SELECT * FROM assignments"
    );

    res.json({
      data: rows
    });

  } catch (error) {

    console.error("ASSIGNMENTS ERROR:", error);

    res.status(500).json({
      message: "โหลดข้อมูลไม่สำเร็จ"
    });

  }

});


// =====================
// EVALUATION
// =====================

app.get("/api/evaluation/:id", async (req, res) => {

  try {

    // 1. หาแบบประเมิน
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


    // 2. หาหัวข้อการประเมิน
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
      message: "โหลดแบบประเมินไม่สำเร็จ"
    });

  }

});


// =====================
// START SERVER
// =====================

app.listen(PORT, () => {

  console.log(
    `Server: http://localhost:${PORT}`
  );

});
 
