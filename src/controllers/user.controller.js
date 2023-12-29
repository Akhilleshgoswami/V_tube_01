import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  /* 
    1. get user details from front-end 
    2. validation - not empty
    3. check if already exists  username email
    4. check for images , check avatar 
    5. upload them to cloudinary , avatar 
    6. create user object  -  create entry in db 
    7. remove passowrd and refresh token filed from response 
    8. check for user creation 
    9. return res
    */
  const { username, fullName, email, passowrd } = req.body;

  // console.log("user", username);
  if (
    [fullName, email, username, passowrd].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All filed are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  console.log("user", existedUser);
  if (existedUser) {
    throw new ApiError(409, "User with email or username Already exits");
  }
  // console.log("files", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (coverImageLocalPath) {
    const cover = await uploadOnCloudinary(coverImageLocalPath);
  }
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  console.log(avatar);
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    passowrd,
    username: username.toLowercase(),
  });
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});
export { registerUser };
