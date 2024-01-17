
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { deleteVideo, getMyVideo, updateThumbnail, updateVideo, uploadVideo } from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();
router.post('/upload',verifyJWT,  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),uploadVideo)
router.patch('/upadte-thumbnail',verifyJWT,upload.single("thumbnail"), updateThumbnail)
router.post('/update',verifyJWT,updateVideo)
router.post('/delete',verifyJWT,deleteVideo)
router.get('/my-videos',verifyJWT,getMyVideo);

export default router;