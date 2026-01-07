import express, { json, static as staticMiddleware } from 'express';
import cors from 'cors';
const app = express();
const port = 3000;//ใช้กับค่าที่ไม่มีการเปลี่ยนแปลง
import { compare, hash } from 'bcryptjs';
import db from './db.js';
import jwt from 'jsonwebtoken'
const { sign, verify } = jwt

// ใช้ jwt สำหรับการยืนยันตัวตน
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    req.user = decoded
    next()
  })
}


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(json());
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import multer, { diskStorage } from 'multer';
import path from 'path';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ตั้งค่า multer สำหรับการอัปโหลดรูป
const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ต้องมีโฟลเดอร์นี้
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });//สำคัญการเรียกใช้
// ตั้งค่า cors และ static file
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username or password missing' })
  }

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' })

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const user = results[0]

    compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Bcrypt error' })
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' })
      }

      const token = sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        'your_secret_key',
        { expiresIn: '1h' }
      )

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          avatar: user.avatar    
        }
      })

    })
  })
})


// GET: ดึงข้อมูลผู้ใช้ทั้งหมด
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
}
  // GET: ดึงข้อมูลผู้ใช้ตาม ID
);
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

app.get('/dashboard', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }
  res.json({ message: 'Welcome Admin!' })
})


app.post('/signup', upload.single('avatar'), async (req, res) => {
  const { fname, lname, username, password, role } = req.body;
  const avatar = req.file?.filename || null;

  if (!fname || !lname || !username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = await hash(password, 10);
  // 10 = salt (การสุ่มค่าเพื่อเพิ่มความซับซ้อนในการเข้ารหัส)
  // และมันจะถูกนำมาใช้ตอน compare
  const sql = `INSERT INTO users (fname, lname, username, password, avatar, role)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [fname, lname, username, hashedPassword, avatar, role], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(201).json({ message: 'Signup successful' });
  });
});



// UPDATE: แก้ไขผู้ใช้
app.put('/users/:id', (req, res) => {
  const { fname, lname, username } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE users SET fname = ?, lname = ?, username = ? WHERE id = ?',
    [fname, lname, username, id],
    (err) => {
      if (err) throw err;
      res.json({ message: 'User updated' });
    }
  );
});

// DELETE: ลบผู้ใช้
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.json({ message: 'User deleted' });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
