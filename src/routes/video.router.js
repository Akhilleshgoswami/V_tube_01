
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { getMyVideo, uploadVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();
//  create comment 
router.post('/upload',verifyJWT,  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),uploadVideo)
router.get('/my-videos',verifyJWT,getMyVideo);

export default router;