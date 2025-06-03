import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

export const postBlog = async (req, res) => {
  const { title, description, category } = req.body;

  let parsedCategory = JSON.parse(category);
  if (!title || !description || !parsedCategory || parsedCategory.length === 0) {
    return res.status(400).json({ message: "All fields are required including at least one category" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image is required" });
  }

  const file = await uploadImageToCloudinary(req.file.path);

  if (!file) {
    return res.status(500).json({ message: "Image upload failed" });
  }

  try {
    const newBlog = await Blog.create({
      title,
      description,
      image: file,
      category: parsedCategory,
      userId: req.user._id,
    });

    if (!newBlog) {
      return res.status(400).json({ message: "Failed to create blog" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { blog: newBlog._id },
    });

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllBlogs = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const blogs = await Blog.find({ userId });

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found for this user" });
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteBlog = async (req, res) => {
  const { blogId } = req.params;
  if (!blogId) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  const { blogId } = req.params;
  const { title, description, image, userId } = req.body;

  if (!blogId) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        description,
        image,
        $addToSet: { like: userId }, 
      },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

