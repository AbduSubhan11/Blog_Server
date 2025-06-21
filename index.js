import express from "express";
import { blogrouter } from "./api/blog.route.js";
import { authRouter } from "./api/auth.route.js";
import connectDB from "./connectdb/connect.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://future-tech-ai.netlify.app/"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/v2", blogrouter);
app.use("/api/v1", authRouter);

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to DB:", error);
  });
