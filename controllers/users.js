import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const users = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Пользователь удален" });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};

export const editUser = async (req, res) => {
  try {
    const { username, role, password } = req.body;
    const data = {
      username,
      role,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    await User.findByIdAndUpdate(req.params.id, data);

    res.status(200).json({ message: "Пользователь обновлен" });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка сервера",
    });
  }
};
