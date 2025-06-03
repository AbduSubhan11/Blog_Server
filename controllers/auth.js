import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateAuthToken } from "../utils/jwt.js";

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
      secure: true,
      sameSite: "none",
    });
    
    res.status(200).json({
      user,
      token,
      message: "Login successful"
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

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
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

  localStorage.setItem("token", token);
  

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
    const user  = req.user
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log(user);
    
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
