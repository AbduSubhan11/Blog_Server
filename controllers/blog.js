import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { uploadImageToCloudinary } from "../utils/cloudinary.js";

export const postBlog = async (req, res) => {
  const { title, description, category } = req.body;

  let parsedCategory = JSON.parse(category);
  if (
    !title ||
    !description ||
    !parsedCategory ||
    parsedCategory.length === 0
  ) {
    return res.status(400).json({
      message: "All fields are required ",
    });
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
      return res
        .status(404)
        .json({ message: "No blogs found please post your blog" });
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
  const { title, description, category } = req.body;
  const { blogId } = req.params;

  let parsedCategory;
  try {
    parsedCategory = JSON.parse(category);
  } catch (err) {
    return res.status(400).json({ message: "Invalid category format" });
  }

  if (!req.user || !req.user._id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (String(blog.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let imageUrl = blog.image;

    if (req.file) {
      const cloudinaryImage = await uploadImageToCloudinary(req.file.path);
      if (!cloudinaryImage) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      imageUrl = cloudinaryImage;
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.image = imageUrl;
    blog.category = parsedCategory || blog.category;

    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsersBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate(
      "userId",
      "name email profilePicture "
    );

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlog = async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    const blog = await Blog.findById(blogId).populate(
      "userId",
      "name email profilePicture"
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeOrUnlikeBlog = async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const alreadyLiked = blog.like.includes(userId);
    if (alreadyLiked) {
      blog.like = blog.like.filter((id) => String(id) !== String(userId));
    } else {
      blog.like.push(userId);
    }

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate(
      "userId",
      "name email profilePicture"
    );

    res.status(200).json(populatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
