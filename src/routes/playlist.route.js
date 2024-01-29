
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { addSongs, createPlaylist, playlist, removeSong } from '../controllers/playlist.controller.js';
const router = Router();
//  create playlist 
router.post('/create',verifyJWT,createPlaylist)
router.post('/add',verifyJWT,addSongs)

router.get('/',verifyJWT,playlist)
// router.patch('/update',verifyJWT,)
router.post('/remove',verifyJWT,removeSong)
export default router;