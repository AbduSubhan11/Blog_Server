import express from "express";
import { deleteBlog, getAllBlogs, postBlog, updateBlog } from "../controllers/blog.js";
import { authenticate } from "../middleware/userRef.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const router = express.Router();


router.get("/user/:userId/blogs", authenticate,  getAllBlogs);
router.post("/createblog", authenticate, upload.single("image"),  postBlog);
router.delete("/blog/:blogId", authenticate, deleteBlog);
router.put("/blog/:blogId", authenticate, upload.single("image"),  updateBlog);
