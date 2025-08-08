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
import Camera from "./models/Camera.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const hlsPath = path.join(__dirname, "streams");
if (!fs.existsSync(hlsPath)) fs.mkdirSync(hlsPath);

const activeStreams = new Map(); // kameralar uchun ffmpeg processlar

const streamCamera = (cameraId) => {
  if (activeStreams.has(cameraId)) {
    console.log(`Stream already active for camera ${cameraId}`);
    return;
  }

  Camera.findById(cameraId).then((camera) => {
    if (!camera) return;

    const { ip, login, password, channel = 1 } = camera;
    const rtspUrl = `rtsp://${login}:${password}@${ip}/cam/realmonitor?channel=1&subtype=0`;

    const cameraStreamPath = path.join(hlsPath, cameraId.toString());
    if (!fs.existsSync(cameraStreamPath)) fs.mkdirSync(cameraStreamPath);

    const ffmpeg = spawn("ffmpeg", [
      "-i", rtspUrl,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-c:a", "aac",
      "-f", "hls",
      "-hls_time", "2",
      "-hls_list_size", "5",
      "-hls_flags", "delete_segments",
      path.join(cameraStreamPath, "stream.m3u8"),
    ]);

    activeStreams.set(cameraId, ffmpeg);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg [${cameraId}]:`, data.toString());
    });

    ffmpeg.on("exit", (code) => {
      console.log(`FFmpeg [${cameraId}] exited with code ${code}`);
      activeStreams.delete(cameraId);
    });
  });
};

const stopStream = (cameraId) => {
  const ffmpeg = activeStreams.get(cameraId);
  if (ffmpeg) {
    ffmpeg.kill("SIGKILL");
    activeStreams.delete(cameraId);
    console.log(`Stopped stream for camera ${cameraId}`);
  }
};

dotenv.config();
connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "http://93.188.83.75:3000",
  "http://192.168.88.223:3000",
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

app.post("/api/stream/start/:id", (req, res) => {
  const cameraId = req.params.id;
  streamCamera(cameraId);
  res.json({ message: `Started stream for camera ${cameraId}` });
});

app.post("/api/stream/stop/:id", (req, res) => {
  const cameraId = req.params.id;
  stopStream(cameraId);
  res.json({ message: `Stopped stream for camera ${cameraId}` });
});

app.use("/hls", express.static(hlsPath));
app.use("/api/auth", authRoutes);
app.use("/api/cameras", camerasRoutes);
app.use("/api/users", usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
