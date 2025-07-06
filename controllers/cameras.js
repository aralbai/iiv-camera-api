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

    return res.status(201).json({ message: "Камера успешно добавлена" });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
      error: err,
    });
  }
};

export const getCameras = async (req, res) => {
  try {
    const { cameraType, startDate, endDate, page, limit = 10 } = req.query;

    const filter = {};

    if (cameraType && cameraType !== "all") {
      filter.cameraType = cameraType;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let cameras;

    if (!page) {
      cameras = await Camera.find(filter).sort({ createdAt: -1 });
    } else {
      cameras = await Camera.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Camera.countDocuments(filter);

    res.status(200).json({
      data: cameras,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
      error: err,
    });
  }
};

export const editCamera = async (req, res) => {
  try {
    const { cameraType, address, longitude, latitude } = req.body;

    console.log(req.body);

    await Camera.findByIdAndUpdate(req.params.id, {
      cameraType,
      address,
      position: [longitude, latitude],
    });

    res.status(200).json({
      message: "Камера успешно обновлена",
    });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
      error: err,
    });
  }
};

export const deleteCamera = async (req, res) => {
  try {
    await Camera.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Камера успешно удалена" });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
      error: err,
    });
  }
};
