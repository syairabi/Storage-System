// src/routes/file.ts
import express from 'express';
import multer from 'multer';
import { FileController } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import File, { IFile } from '../models/File';
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

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  else return (bytes / 1073741824).toFixed(1) + ' GB';
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });
};

router.get('/file', async (req, res)=>{
  try {
    const softwarefiles = await File.find({ 
        category: "Software" 
    }).sort({ lastModified: -1 });

    const hardwarefiles = await File.find({ 
      category: "Hardware" 
  }).sort({ lastModified: -1 });

    res.render('file.ejs', {
        softwarefiles,
        hardwarefiles,
        formatFileSize,
        formatDate
    });
} catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Error fetching files');
}
})

router.get('/update', (req, res)=>{
  res.render('update.ejs');
})
router.get('/logout', (req, res)=>{
  res.render('logout.ejs');
})

router.post('/software', 
  //auth, 
  upload.single('file'), // Allow up to 5 files
  FileController.uploadSoftwareFiles
);

router.post('/hardware', 
  //auth, 
  upload.single('file'), // Allow up to 5 files
  FileController.uploadHardwareFiles
);

router.post('/upload', auth, upload.single('file'), FileController.uploadFile);
router.get('/', auth, FileController.getAllFiles);
router.get('/download/:id', auth, FileController.downloadFile);
router.post('/backup/:id', auth, FileController.createBackup);
router.delete('/:id', auth, FileController.deleteFile);

export default router;