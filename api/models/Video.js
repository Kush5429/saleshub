const mongoose = require("mongoose");
const s = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  videoUrl:    { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, default: "Demo", trim: true },
}, { timestamps: true });
module.exports = mongoose.models.Video || mongoose.model("Video", s);
