import { Router } from 'express';
import multer from 'multer';
import { getPhotoMetadata } from '../controllers/photoController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/metadata', upload.single('photo'), getPhotoMetadata);

export default router;
