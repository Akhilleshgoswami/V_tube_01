import { Router } from "express";
import {
  logInUser,
  registerUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassowrd,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(logInUser);

//  secured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassowrd);
// update route
router.route("/upadte-account").patch(verifyJWT, getCurrentUser);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
// get route
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/").get(verifyJWT, getUserChannelProfile);
router.route("/histroy").get(verifyJWT, getUserWatchHistory);

export default router;
