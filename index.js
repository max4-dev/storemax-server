import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import B2 from 'backblaze-b2';

import { registerValidation, loginValidation } from './validations.js';
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

const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID,
  applicationKey: process.env.B2_KEY,
});

b2.authorize().then(() => {
  console.log('B2 authorized');
});

const uploadFileToB2 = async (bucketName, fileName, filePath) => {
  const bucket = await b2.getBucket({ bucketName });
  const uploadUrl = await b2.getUploadUrl({ bucketId: process.env.BUCKEET_ID });
  const fileData = await fs.promises.readFile(filePath);
  const fileInfo = await b2.uploadFile({
    uploadUrl: uploadUrl.data.uploadUrl,
    uploadAuthToken: uploadUrl.data.authorizationToken,
    bucketId: process.env.BUCKEET_ID,
    fileName: fileName,
    data: fileData,
  });
  return fileInfo;
};

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

app.post('/upload', checkIsAdmin, upload.single('image'), async (req, res) => {
  const fileName = req.file.filename;
  const filePath = req.file.path;
  const bucketName = process.env.BUCKET_NAME;

  try {
    const fileInfo = await uploadFileToB2(bucketName, fileName, filePath);
    const fileUrl = `https://f003.backblazeb2.com/file/${bucketName}/${fileInfo.data.fileName}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to upload file' });
  } finally {
    fs.unlinkSync(filePath);
  }
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
