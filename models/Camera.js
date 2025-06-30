import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema({
  cameraType: {
    type: String,
    required: true,
    enum: ["ptz", "radar", "lis"],
  },
  address: {
    type: String,
  },
  position: {
    type: [Number],
    required: true,
    validate: {
      validator: function (val) {
        return val.length === 2;
      },
      message: "Position must be [longitude, latitude]",
    },
  },
});

export default mongoose.model("Camera", cameraSchema);
