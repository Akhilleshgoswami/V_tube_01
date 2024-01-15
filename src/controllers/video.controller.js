import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const uploadVideo = asyncHandler(async (req, res) => {

  const { title, discription } = req.body;
  if (!title || !discription)
    throw new ApiError(400, "Video title or description is required");
  if (!req.files?.videoFile)
    throw new ApiError(400, "video file is required");
 let videoLocalPath = req.files?.videoFile[0]?.path;
  const video = await uploadOnCloudinary(videoLocalPath);
  if (!video?.url) {
    throw new ApiError(400, "Error while uploading on cloud");
  }
  let thumbnailUrl = "";
  if (req.files?.thumbnail) {
    let thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (thumbnailLocalPath) {
      const thumbnailURL = await uploadOnCloudinary(thumbnailLocalPath);
      thumbnailUrl = thumbnailURL?.url;
    }
  }
  const uploadedVideo = await Video.create({
    title,
    discription,
    videoFile: video?.url,
    thumbnail: thumbnailUrl,
    duration: video?.duration,
    views: 0,
    owner: req?.user._id,
  });
  return res.status(201).json(new ApiResponse(201,uploadedVideo,"Video uploaded successfully"))
});
// const updateVideo = asyncHandler(async(req,res)=>{
    
//     const 
//     if(!videoId) throw ApiError(400,"Video id is requried")

// })
const getMyVideo = asyncHandler(async(req,res)=>{
const videos = await Video.find({owner:req?.user._id})
return res.status(200).json(new ApiResponse(200,videos,"videos fetched successfully"))
})
export { uploadVideo,getMyVideo };
