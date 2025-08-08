import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import camerasRoutes from "./routes/cameras.js";
import usersRoutes from "./routes/users.js";

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const rtspUrl =
  "rtsp://admin:Sl@ym224@10.144.184.49:554/cam/realmonitor?channel=2&subtype=0";

const hlsPath = path.join(__dirname, "streams");
if (!fs.existsSync(hlsPath)) fs.mkdirSync(hlsPath);

const ffmpeg = spawn("ffmpeg", [
  "-i",
  rtspUrl,
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-tune",
  "zerolatency",
  "-c:a",
  "aac",
  "-f",
  "hls",
  "-hls_time",
  "2",
  "-hls_list_size",
  "5",
  "-hls_flags",
  "delete_segments",
  path.join(hlsPath, "stream.m3u8"),
]);

ffmpeg.stderr.on("data", (data) => {
  console.log("FFmpeg:", data.toString());
});

dotenv.config();
connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://93.188.83.75:3000",
  "http://192.168.88.72:3000",
  "https://iivcamera.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/hls", express.static(hlsPath));
app.use("/api/auth", authRoutes);
app.use("/api/cameras", camerasRoutes);
app.use("/api/users", usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
