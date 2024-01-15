
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();
//  create comment 
router.post('/create',verifyJWT,)


export default router;