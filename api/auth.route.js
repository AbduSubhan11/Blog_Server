import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
} from "../controllers/auth.js";
import { authenticateUser } from "../middleware/user.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", upload.single("profilePicture"), register);
authRouter.put(
  "/updateprofile/:userId",
  authenticateUser,
  upload.single("profilePicture"),
  updateProfile
);
authRouter.post("/logout", logout);
authRouter.get("/user", authenticateUser, getCurrentUser);
