import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAuthToken } from "../utils/jwt.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

export const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required" });
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateAuthToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({
      user,
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is required" });
  }
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Profile Image is required" });
  }

  const file = await uploadImageToCloudinary(req.file.path);

  if (!file) {
    return res.status(500).json({ message: "Image upload failed" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
    profilePicture: file,
  });

  if (!createdUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const token = generateAuthToken(createdUser);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(201).json({
    user: {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
    },
    message: "Registration successful",
  });
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(user);

    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.params;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication failed. No user data provided." });
  }

  if (!userId || userId !== req.user.id.toString()) {
    return res.status(403).json({ message: "Unauthorized to update this profile" });
  }

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const updateData = { name, email };
    if (req.file) {
      const file = await uploadImageToCloudinary(req.file.path);
      if (!file) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      updateData.profilePicture = file;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { runValidators: true, new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      token: req.newAccessToken,
    });
  } catch (error) {
    console.log("Error in updateProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};
