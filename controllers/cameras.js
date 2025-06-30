import Camera from "../models/Camera.js";

export const addCamera = async (req, res) => {
  try {
    const { cameraType, address, longitude, latitude } = req.body;

    const newCamera = new Camera({
      cameraType,
      address,
      position: [longitude, latitude],
    });

    await newCamera.save();

    return res.status(201).json("Camera added successfully!");
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err,
    });
  }
};

export const getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find();

    return res.status(201).json(cameras);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err,
    });
  }
};
