import express from "express";
import cors from "cors";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET || "hr_secret";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath))
  fs.mkdirSync(uploadPath, { recursive: true });

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use("/uploads", express.static(uploadPath));


// ===============================
// Upload
// ===============================

const upload = multer({
  dest: uploadPath,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});


// ===============================
// JWT
// ===============================

function auth(req, res, next) {

  const token =
    req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({
      message: "กรุณาเข้าสู่ระบบ"
    });

  try {

    req.user = jwt.verify(
      token,
      SECRET
    );

    next();

  } catch {

    res.status(401).json({
      message: "Token ไม่ถูกต้องหรือหมดอายุ"
    });

  }
}


function role(...roles) {

  return (req, res, next) => {

    if (!roles.includes(req.user.role))
      return res.status(403).json({
        message: "ไม่มีสิทธิ์ใช้งาน"
      });

    next();
  };

}


// ===============================
// Test
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "HRsystem API is running"
  });
});


// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    // ตรวจสอบข้อมูล
    if (!username || !password) {

      return res.status(400).json({
        message: "กรุณากรอก Username และ Password"
      });

    }

    // ค้นหา User
    const [rows] = await db.promise().query(
      `
      SELECT
        id,
        fname,
        lname,
        username,
        password,
        role,
        avatar
      FROM users
      WHERE username = ?
      `,
      [username]
    );

    // ไม่พบ User
    if (rows.length === 0) {

      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });

    }

    const user = rows[0];

    // ตรวจสอบ Password
    const validPassword = await compare(
      password,
      user.password
    );

    if (!validPassword) {

      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });

    }

    // สร้าง JWT
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

    // ส่งข้อมูลกลับ
    res.json({

      success: true,

      message: "เข้าสู่ระบบสำเร็จ",

      token,

      user: {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }

    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "เกิดข้อผิดพลาดในระบบ"
    });

  }

});

app.post("/signup", async (req, res) => {

  try {

    const {
      fname,
      lname,
      username,
      password,
      role
    } = req.body;


    // ตรวจสอบข้อมูล
    if (
      !fname ||
      !lname ||
      !username ||
      !password ||
      !role
    ) {

      return res.status(400).json({
        message: "กรุณากรอกข้อมูลให้ครบถ้วน"
      });

    }


    // ===============================
    // Role ที่อนุญาต
    // ===============================

    const allowedRoles = [
      "personnel",
      "evaluatee",
      "evaluator"
    ];


    if (!allowedRoles.includes(role)) {

      return res.status(400).json({
        message: "ไม่สามารถสมัคร Role นี้ได้"
      });

    }


    // ===============================
    // ตรวจ Username ซ้ำ
    // ===============================

    const [existing] = await db.promise().query(
      `
      SELECT id
      FROM users
      WHERE username = ?
      `,
      [username]
    );


    if (existing.length > 0) {

      return res.status(409).json({
        message: "Username นี้ถูกใช้งานแล้ว"
      });

    }


    // ===============================
    // Hash Password
    // ===============================

    const hashedPassword = await hash(
      password,
      10
    );


    // ===============================
    // เพิ่ม User
    // ===============================

    await db.promise().query(
      `
      INSERT INTO users
      (
        fname,
        lname,
        username,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        fname,
        lname,
        username,
        hashedPassword,
        role
      ]
    );


    // ===============================
    // สำเร็จ
    // ===============================

    res.status(201).json({

      success: true,

      message: "สมัครสมาชิกสำเร็จ"

    });


  } catch (error) {

    console.error("SIGNUP ERROR:", error);

    res.status(500).json({

      success: false,

      message: "เกิดข้อผิดพลาดในระบบ"

    });

  }

});


// ===============================
// USERS
// ===============================

app.get(
  "/users",
  auth,
  role("personnel"),
  (req, res) => {

    db.query(
      `SELECT id,fname,lname,username,role,avatar
       FROM users`,
      (err, rows) => {

        if (err)
          return res.status(500).json({
            message: "Database error"
          });

        res.json(rows);

      }
    );

  }
);


app.get(
  "/users/:id",
  auth,
  (req, res) => {

    db.query(
      `SELECT id,fname,lname,username,role,avatar
       FROM users
       WHERE id = ?`,
      [req.params.id],
      (err, rows) => {

        if (err)
          return res.status(500).json({
            message: "Database error"
          });

        if (!rows.length)
          return res.status(404).json({
            message: "ไม่พบผู้ใช้"
          });

        res.json(rows[0]);

      }
    );

  }
);


// ===============================
// EVALUATION
// ===============================

app.get(
  "/api/evaluation/:id",
  auth,
  async (req, res) => {

    try {

      const [teacher] = await db.query(`
        SELECT
          e.id,
          e.employee_code,
          e.name,
          e.position,
          d.name AS department
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        WHERE e.id = ?
      `, [req.params.id]);

      if (!teacher.length)
        return res.status(404).json({
          message: "ไม่พบข้อมูลบุคลากร"
        });

      const [criteria] = await db.query(`
        SELECT
          id,
          code,
          name,
          description,
          weight,
          max_score
        FROM indicators
        WHERE active = 1
        ORDER BY code
      `);

      res.json({
        teacher: teacher[0],
        criteria
      });

    } catch {

      res.status(500).json({
        message: "โหลดข้อมูลไม่สำเร็จ"
      });

    }

  }
);


// ===============================
// SAVE DRAFT
// ===============================

app.post(
  "/api/self-assessment/draft",
  auth,
  upload.any(),
  async (req, res) => {

    const conn =
      await db.getConnection();

    try {

      const {
        employee_id,
        period_id
      } = req.body;

      const assessments =
        JSON.parse(
          req.body.assessments || "[]"
        );

      await conn.beginTransaction();

      for (const item of assessments) {

        await conn.query(
          `INSERT INTO self_assessments
          (employee_id,indicator_id,period_id,
           score,description,status)
          VALUES (?,?,?,?,?,'draft')
          ON DUPLICATE KEY UPDATE
          score=VALUES(score),
          description=VALUES(description),
          updated_at=CURRENT_TIMESTAMP`,

          [
            employee_id,
            item.indicator_id,
            period_id,
            item.score ?? null,
            item.note || ""
          ]
        );

        const [rows] =
          await conn.query(
            `SELECT id
             FROM self_assessments
             WHERE employee_id=?
             AND indicator_id=?
             AND period_id=?`,

            [
              employee_id,
              item.indicator_id,
              period_id
            ]
          );

        if (!rows.length) continue;

        const files = req.files.filter(
          file =>
            file.fieldname ===
            `evidence_${item.indicator_id}`
        );

        for (const file of files) {

          await conn.query(
            `INSERT INTO evidence_files
            (assessment_id,file_name,
             file_path,file_type,file_size)
            VALUES (?,?,?,?,?)`,

            [
              rows[0].id,
              file.originalname,
              `/uploads/${file.filename}`,
              file.mimetype,
              file.size
            ]
          );

        }

      }

      await conn.commit();

      res.json({
        success: true,
        message: "บันทึกข้อมูลเรียบร้อย"
      });

    } catch (error) {

      await conn.rollback();

      res.status(500).json({
        success: false,
        message: "บันทึกข้อมูลไม่สำเร็จ",
        error: error.message
      });

    } finally {

      conn.release();

    }

  }
);


// ===============================
// SUBMIT
// ===============================

app.post(
  "/api/self-assessment/submit",
  auth,
  async (req, res) => {

    try {

      const {
        employee_id,
        period_id
      } = req.body;

      await db.query(
        `UPDATE self_assessments
         SET status='submitted',
         updated_at=CURRENT_TIMESTAMP
         WHERE employee_id=?
         AND period_id=?`,

        [
          employee_id,
          period_id
        ]
      );

      res.json({
        success: true,
        message: "ส่งแบบประเมินเรียบร้อย"
      });

    } catch {

      res.status(500).json({
        success: false,
        message: "ส่งแบบประเมินไม่สำเร็จ"
      });

    }

  }
);


// ===============================
// DASHBOARD
// ===============================

app.get(
  "/dashboard",
  auth,
  role("personnel"),
  (req, res) => {

    res.json({
      message: "Welcome Admin!"
    });

  }
);


// ===============================
// UPDATE USER
// ===============================

app.put(
  "/users/:id",
  auth,
  role("admin"),
  (req, res) => {

    const {
      fname,
      lname,
      username,
      role
    } = req.body;

    db.query(
      `UPDATE users
       SET fname=?,lname=?,username=?,role=?
       WHERE id=?`,

      [
        fname,
        lname,
        username,
        role,
        req.params.id
      ],

      err => {

        if (err)
          return res.status(500).json({
            message: "แก้ไขไม่สำเร็จ"
          });

        res.json({
          message: "User updated"
        });

      }
    );

  }
);


// ===============================
// DELETE USER
// ===============================

app.delete(
  "/users/:id",
  auth,
  role("personnel"),
  (req, res) => {

    db.query(
      "DELETE FROM users WHERE id=?",
      [req.params.id],
      err => {

        if (err)
          return res.status(500).json({
            message: "ลบไม่สำเร็จ"
          });

        res.json({
          message: "User deleted"
        });

      }
    );

  }
);


// ===============================
// START
// ===============================

app.listen(PORT, () => {

  console.log(
    `Server running: http://localhost:${PORT}`
  );

});