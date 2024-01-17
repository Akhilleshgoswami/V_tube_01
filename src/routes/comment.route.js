
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addComment, deleteComment, getAllComment, updateComment } from '../controllers/comment.controller.js';
const router = Router();
//  create comment 
router.post('/add',verifyJWT,addComment)
router.get('/',getAllComment)
router.patch('/update',verifyJWT,updateComment)
router.patch('/delete',verifyJWT,deleteComment)
export default router;