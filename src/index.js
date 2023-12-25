import connectDb from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(" Mongo DB  connection fail", error);
  });

/*import express from "express";
const app = express()
;(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("Error",(error)=>{
        console.log("Eror",error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log("App listen on ",process.env.PORT)
       })
    } catch (error) {
        console.error("ERROR",error)
    }
}
)()*/
