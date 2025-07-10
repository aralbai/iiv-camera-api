import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema(
  {
    cameraType: {
      type: String,
      required: true,
      enum: ["ptz", "radar", "lis", "avto", "obz"],
    },
    district: {
      type: String,
      required: true,
    },
    mahalla: {
      type: String,
      required: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("Camera", cameraSchema);
