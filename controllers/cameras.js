import Camera from "../models/Camera.js";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// __dirname va __filename olish
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fayl yo‘li
const filePath = path.join(__dirname, "../data/qoraqalpogiston.geojson");

// Faylni o‘qib, JSON qilib olish
const fileContent = await readFile(filePath, "utf-8");
const geojson = JSON.parse(fileContent);

export const addCamera = async (req, res) => {
  try {
    const { cameraType, longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json("Необходимы координаты.");
    }

    const point = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const foundMahalla = geojson.features.find((feature) =>
      booleanPointInPolygon(point, feature)
    );

    if (!foundMahalla) {
      return res.status(400).json("МПЖ не найден");
    }

    const { district, mahalla_no } = foundMahalla.properties;

    console.log(district, mahalla_no);

    const newCamera = new Camera({
      cameraType,
      district,
      mahalla: mahalla_no,
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
    const {
      cameraType,
      district,
      mahalla,
      startDate,
      endDate,
      page,
      limit = 10,
    } = req.query;

    const filter = {};

    if (cameraType && cameraType !== "all") {
      filter.cameraType = cameraType;
    }

    if (district && district !== "all") {
      filter.district = district;
    }

    if (mahalla && mahalla !== "all") {
      filter.mahalla = mahalla;
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
    const { id } = req.params;
    const { cameraType, longitude, latitude } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json("Необходимы координаты.");
    }

    const point = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const foundMahalla = geojson.features.find((feature) =>
      booleanPointInPolygon(point, feature)
    );

    if (!foundMahalla) {
      return res.status(400).json("МПЖ не найден");
    }

    const { district, mahalla_no } = foundMahalla.properties;

    const newData = {
      cameraType,
      district,
      mahalla: mahalla_no,
      position: [longitude, latitude],
    };

    await Camera.findByIdAndUpdate(id, newData);

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
