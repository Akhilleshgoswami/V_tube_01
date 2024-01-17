import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId, content } = req.body;
  const owner = req.user._id;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.create({
    video: videoId,
    content,
    owner,
  });
  if (!comment) {
    throw new ApiError(404, "video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfull"));
});
const getAllComment = asyncHandler(async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) throw new ApiError(400, "video Id is requried");
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const comment = await Comment.find({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment fechted successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  const { commentId, content } = req.body;
  if (!commentId) {
    throw new ApiError(400, "Comment id s requreid");
  }
  if (!content) throw new ApiError(400, "content should not be empty");

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Unauthorized access");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment Update successfull"));
});

const deleteComment = asyncHandler(async(req,res)=>{
const { commentId } = req.body;
  if (!commentId) {
    throw new ApiError(400, "Comment id s requreid");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!comment.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Unauthorized access");
  }
  await Comment.findOneAndDelete(commentId)
  return res.status(200).json(new ApiResponse(200,{},"comment deleted successfully"))
}
)
export { addComment, getAllComment, updateComment,deleteComment};
