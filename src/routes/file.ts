import express from 'express';
import multer from 'multer';
import { FileController } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import { FileUtils } from '../utils/fileUtils';
import path from 'node:path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FileUtils.getUploadPath());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});


const upload = multer({ storage });

const router = express.Router();

router.get('/homepage', (req, res)=>{
  res.render('homepage.ejs');
})

router.get('/file', (req, res)=>{
  res.render('file.ejs');
})

router.get('/update', (req, res)=>{
  res.render('update.ejs');
})

router.post('/upload', auth, upload.single('file'), FileController.uploadFile);
router.get('/', auth, FileController.getAllFiles);
router.get('/download/:id', auth, FileController.downloadFile);
router.post('/backup/:id', auth, FileController.createBackup);
router.delete('/:id', auth, FileController.deleteFile);

export default router;