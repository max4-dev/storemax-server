import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';

import { registerValidation, loginValidation, goodsValidation } from './validations.js';
import { UserController, GoodsController } from './controllers/index.js';
import { chechAuth, checkIsAdmin, handleValidationErrors } from './utils/index.js';

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('DB ok');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.get('/auth/me', chechAuth, UserController.getMe);

app.post('/upload', checkIsAdmin, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

app.get('/goods', GoodsController.getAll);
app.get('/goods/:id', GoodsController.getOne);
app.post('/goods', GoodsController.create);
app.delete('/goods/:id', checkIsAdmin, GoodsController.remove);
app.patch('/goods/:id', checkIsAdmin, handleValidationErrors, GoodsController.update);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Server is running');
});
