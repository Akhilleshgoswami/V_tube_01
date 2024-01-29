import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  let { name, discription, videos } = req.body;
  if (!videos) videos = [];
  if (!name || !discription)
    throw new ApiError(400, "name or discription is required");
  const playlist = await Playlist.create({
    name,
    discription,
    video: videos,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist create successfully"));
});
const playlist = asyncHandler(async (req, res) => {
  const listId = req.query.listId;
  if (!listId) {
    throw new ApiError(400, "list id is requreid");
  }
  const playlist = await Playlist.findById(listId);
  if (!playlist) {
    throw new ApiError(404, "List not found");
  }
  if (!playlist.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Unotherized access");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});
const removeSong = asyncHandler(async(req,res)=>{
  const { listId, vidoes } = req.body;
  if (!listId) {
    throw new ApiError(400, "list id is requreid");
  }
  const playlist = await Playlist.findById(listId);
  if (!playlist) {
    throw new ApiError(404, "List not found");
  }
  if (!playlist.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Unotherized access");
  }
  const videosToRemove = await Promise.all(
    vidoes.map((videoId) => Video.exists({ _id: videoId }))
  );
  if(videosToRemove.length === 0) throw new ApiError(404,"video id not found")
  const updateResult = await Playlist.updateOne(
    { _id: listId },
    { $pull: { vidoes: { $in: videosToRemove } } }
  );
  // if (updateResult.nModified == 0) {
  //    throw new ApiError(404,'No matching Video IDs found or document not found')
  // }
  res.status(200).json(new ApiResponse(200,{},'delete success fully',))
  
})
const addSongs = asyncHandler(async (req, res) => {
  const { listId, vidoes } = req.body;
  if (!listId) {
    throw new ApiError(400, "list id is requreid");
  }
  const playlist = await Playlist.findById(listId);
  if (!playlist) {
    throw new ApiError(404, "List not found");
  }
  if (!playlist.owner.equals(req.user?._id)) {
    throw new ApiError(401, "Unotherized access");
  }
  const validVideo = await Promise.all(
    vidoes.map((videoId) => Video.exists({ _id: videoId }))
  );
  const filteredValidVideo = validVideo.filter((videoId) => videoId !== null);

  await Playlist.updateOne(
    { _id: listId },
    { $addToSet:  { vidoes: { $each: filteredValidVideo } }  },
  );
  const updatedPlaylist = await Playlist.findById(listId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "song added successfully"));
});
export { createPlaylist, addSongs, playlist,removeSong };
