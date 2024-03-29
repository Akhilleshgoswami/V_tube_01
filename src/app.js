import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//  routes  import 
import userRouter from './routes/user.route.js'
import commentRouter from './routes/comment.route.js'
//  routes declaration 
import videoRouter  from './routes/video.router.js'
import PlaylistRouter from './routes/playlist.route.js'
app.use("/api/v1/users",userRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/playlist",PlaylistRouter)
// app.use("/users",login)
export { app };
