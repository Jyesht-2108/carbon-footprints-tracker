import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const controller = new UploadController();

// Public upload endpoint (no auth for chatbot)
router.post('/upload', upload.single('file'), controller.upload);
router.get('/upload/:id/status', controller.getStatus);

export default router;
