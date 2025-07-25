import express from "express";
import {
  deleteBlog,
  getAllBlogs,
  getAllUsersBlogs,
  getBlog,
  likeOrUnlikeBlog,
  postBlog,
  updateBlog,
} from "../controllers/blog.js";
import { authenticate } from "../middleware/userRef.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const blogrouter = express.Router();

blogrouter.get("/allusersblogs", getAllUsersBlogs);
blogrouter.get("/user/:userId/blogs", authenticate, getAllBlogs);
blogrouter.post("/createblog", authenticate, upload.single("image"), postBlog);
blogrouter.delete("/blog/:blogId", authenticate, deleteBlog);
blogrouter.put(
  "/blog/:blogId",
  authenticate,
  upload.single("image"),
  updateBlog
);
blogrouter.put("/bloglike/:blogId", authenticate, likeOrUnlikeBlog);
blogrouter.get("/blog/:blogId", getBlog);
