import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const generateAccessAndRefreshToekns = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wroing while generationg referesh and access token"
    );
  }
};

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
  const { username, fullName, email, password } = req.body;

  if (
    [fullName, email, username, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All filed are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username Already exits");
  }
  let coverImageLocalPath, avatarLocalPath;
  if (req.files?.avatar[0]) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }

  if (req.files?.coverImage) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username?.toLowerCase(),
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

const logInUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is requreid");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //  user is used to perfrom operation
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToekns(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //  cookie security
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In SuccessFully"
      )
    );
});
const logOutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,

      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new:true
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logout successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500,{},"Error while logout user"),
        {},
        "something went worng while logout the user"
      );
  }
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
    const user = await User.findById(decodedRefreshToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expried or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToekns(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "User token refreshed successFully"
        )
      );
  } catch (error) {
    return res.status(401).json(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassowrd = asyncHandler(async (req, res) => {
  const { oldPassowrd, newPassword } = req.body;

  const user = await User.findById(req?.user._id);
  const isPassowrdCorrect = user.isPasswordCorrect(oldPassowrd);

  if (!isPassowrdCorrect) {
    throw new ApiError(400, "Invalid password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "current user fetched successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName, email } },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  let avatarLocalPath;
  console.log(req.file)
  if (req.file?.fieldname === 'avatar') {
    avatarLocalPath = req.file?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading on cloud");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Avatar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  let coverImageLocalPath;
  if (req.file?.coverImage) {
    coverImageLocalPath = req.file?.path;
  }

  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(400, "Error while uploading on cloud");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: coverImage?.url } },
    { new: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const  username  = req.query.username;

  if (!username?.trim()) {
    console.log(username)
    throw new ApiError(400, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        email: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});
const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //  sub pipline
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "User history fetched successfully"
      )
    );
});
export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassowrd,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};

