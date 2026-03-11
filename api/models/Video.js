import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    videoUrl:    { type: String, required: true },
    description: { type: String, default: "" },
    category:    { type: String, default: "Demo", trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Video ||
  mongoose.model("Video", VideoSchema);
