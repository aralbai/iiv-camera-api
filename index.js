import express from "express";
import mongoose from "mongoose";
import cameraRouter from "./routes/cameras.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0/iivcamera");

    console.log("MongoDB connected...");
  } catch (err) {
    console.log(err);
  }
};

connectDB();

app.use("/api/cameras", cameraRouter);

app.listen(5000, () => {
  console.log("Server is running on port 5000...");
});
