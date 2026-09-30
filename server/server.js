import express from 'express';
import cors from 'cors';
import { compare, hash } from 'bcryptjs';
import db from './db.js';
import jwt from 'jsonwebtoken';
import multer, { diskStorage } from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


// =====================================================
// 1. ตั้งค่า Server
// =====================================================

const app = express();
const port = 3000;

const { sign, verify } = jwt;


// =====================================================
// 2. ตั้งค่า Path
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, 'uploads');

console.log('Upload path:', uploadPath);


// =====================================================
// 3. Middleware
// =====================================================

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());


// =====================================================
// 4. Static สำหรับรูปภาพ
// =====================================================

app.use(
  '/uploads',
  express.static(uploadPath)
);


// =====================================================
// 5. Multer สำหรับ Upload Avatar
// =====================================================

const storage = diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + '-' + file.originalname;

    cb(null, uniqueName);
  }

});

const upload = multer({
  storage: storage
});


// =====================================================
// 6. JWT ตรวจสอบ Token
// =====================================================

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({
      message: 'Token missing'
    });
  }

  verify(
    token,
    'your_secret_key',
    (err, decoded) => {

      if (err) {
        return res.status(401).json({
          message: 'Invalid token'
        });
      }

      req.user = decoded;

      next();
    }
  );
};


// =====================================================
// 7. Test API
// =====================================================

app.get('/', (req, res) => {

  res.json({
    message: 'HRsystem API is running'
  });

});


// =====================================================
// 8. LOGIN
// =====================================================

app.post('/login', (req, res) => {

  const {
    username,
    password
  } = req.body;


  if (!username || !password) {

    return res.status(400).json({
      error: 'Username or password missing'
    });

  }


  const sql =
    'SELECT * FROM users WHERE username = ?';


  db.query(
    sql,
    [username],
    (err, results) => {

      if (err) {

        console.error(
          'LOGIN DATABASE ERROR:',
          err
        );

        return res.status(500).json({
          error: 'Database error',
          message: err.message
        });

      }


      if (results.length === 0) {

        return res.status(401).json({
          error: 'Invalid username or password'
        });

      }


      const user = results[0];


      compare(
        password,
        user.password,
        (err, isMatch) => {

          if (err) {

            console.error(
              'BCRYPT ERROR:',
              err
            );

            return res.status(500).json({
              error: 'Bcrypt error'
            });

          }


          if (!isMatch) {

            return res.status(401).json({
              error: 'Invalid password'
            });

          }


          const token = sign(
            {
              id: user.id,
              username: user.username,
              role: user.role
            },

            'your_secret_key',

            {
              expiresIn: '1h'
            }
          );


          res.json({

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

        }
      );

    }
  );

});


// =====================================================
// 9. SIGN UP
// =====================================================

app.post(
  '/signup',
  upload.single('avatar'),
  async (req, res) => {

    try {

      console.log('');
      console.log('================================');
      console.log('SIGNUP REQUEST');
      console.log('================================');

      console.log('BODY:', req.body);
      console.log('FILE:', req.file);


      const {
        fname,
        lname,
        username,
        password,
        role
      } = req.body;


      const avatar =
        req.file
          ? req.file.filename
          : null;


      // -----------------------------------------------
      // ตรวจสอบข้อมูล
      // -----------------------------------------------

      if (
        !fname ||
        !lname ||
        !username ||
        !password ||
        !role
      ) {

        return res.status(400).json({
          message: 'All fields are required'
        });

      }


      // -----------------------------------------------
      // เข้ารหัส Password
      // -----------------------------------------------

      const hashedPassword =
        await hash(password, 10);


      // -----------------------------------------------
      // SQL INSERT
      // -----------------------------------------------

      const sql = `
        INSERT INTO users
        (
          fname,
          lname,
          username,
          password,
          avatar,
          role
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;


      db.query(
        sql,

        [
          fname,
          lname,
          username,
          hashedPassword,
          avatar,
          role
        ],

        (err, result) => {

          if (err) {

            console.error('');
            console.error(
              'DATABASE ERROR:',
              err
            );


            // Username ซ้ำ
            if (
              err.code === 'ER_DUP_ENTRY'
            ) {

              return res.status(409).json({
                message:
                  'Username already exists'
              });

            }


            return res.status(500).json({

              message:
                'Database error',

              error:
                err.message

            });

          }


          console.log(
            'SIGNUP SUCCESS'
          );


          return res.status(201).json({

            message:
              'Signup successful',

            userId:
              result.insertId

          });

        }
      );

    }

    catch (error) {

      console.error('');
      console.error(
        'SIGNUP ERROR:',
        error
      );


      return res.status(500).json({

        message:
          'Server error',

        error:
          error.message

      });

    }

  }
);


// =====================================================
// 10. GET USERS
// =====================================================

app.get('/users', (req, res) => {

  db.query(
    'SELECT * FROM users',

    (err, results) => {

      if (err) {

        console.error(
          'GET USERS ERROR:',
          err
        );

        return res.status(500).json({

          message:
            'Database error',

          error:
            err.message

        });

      }


      res.json(results);

    }
  );

});


// =====================================================
// 11. GET USER BY ID
// =====================================================

app.get('/users/:id', (req, res) => {

  const {
    id
  } = req.params;


  db.query(
    'SELECT * FROM users WHERE id = ?',

    [id],

    (err, results) => {

      if (err) {

        console.error(
          'GET USER ERROR:',
          err
        );

        return res.status(500).json({

          message:
            'Database error',

          error:
            err.message

        });

      }


      if (
        results.length === 0
      ) {

        return res.status(404).json({

          message:
            'User not found'

        });

      }


      res.json(
        results[0]
      );

    }
  );

});


// =====================================================
// 12. DASHBOARD
// =====================================================

app.get(
  '/dashboard',
  verifyToken,
  (req, res) => {

    if (
      req.user.role !== 'admin'
    ) {

      return res.status(403).json({

        message:
          'Not authorized'

      });

    }


    res.json({

      message:
        'Welcome Admin!'

    });

  }
);


// =====================================================
// 13. UPDATE USER
// =====================================================

app.put('/users/:id', (req, res) => {

  const {
    fname,
    lname,
    username
  } = req.body;


  const {
    id
  } = req.params;


  const sql = `
    UPDATE users
    SET
      fname = ?,
      lname = ?,
      username = ?
    WHERE id = ?
  `;


  db.query(
    sql,

    [
      fname,
      lname,
      username,
      id
    ],

    (err) => {

      if (err) {

        console.error(
          'UPDATE USER ERROR:',
          err
        );


        if (
          err.code === 'ER_DUP_ENTRY'
        ) {

          return res.status(409).json({

            message:
              'Username already exists'

          });

        }


        return res.status(500).json({

          message:
            'Database error',

          error:
            err.message

        });

      }


      res.json({

        message:
          'User updated'

      });

    }
  );

});


// =====================================================
// 14. DELETE USER
// =====================================================

app.delete('/users/:id', (req, res) => {

  const {
    id
  } = req.params;


  db.query(
    'DELETE FROM users WHERE id = ?',

    [id],

    (err) => {

      if (err) {

        console.error(
          'DELETE USER ERROR:',
          err
        );

        return res.status(500).json({

          message:
            'Database error',

          error:
            err.message

        });

      }


      res.json({

        message:
          'User deleted'

      });

    }
  );

});


// =====================================================
// 15. Global Error Handler
// =====================================================

app.use(
  (err, req, res, next) => {

    console.error(
      '================================'
    );

    console.error(
      'SERVER ERROR:'
    );

    console.error(err);

    console.error(
      '================================'
    );


    res.status(500).json({

      message:
        'Internal Server Error',

      error:
        err.message

    });

  }
);


// =====================================================
// 16. Start Server
// =====================================================

app.listen(
  port,
  () => {

    console.log('');
    console.log(
      '================================'
    );

    console.log(
      `Server running at http://localhost:${port}/`
    );

    console.log(
      '================================'
    );

    console.log(
      'Database: MySQL'
    );

    console.log(
      `Upload folder: ${uploadPath}`
    );

  }
);