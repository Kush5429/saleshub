const mongoose = require("mongoose");
const s = new mongoose.Schema({
  featureName:  { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  releaseMonth: { type: String, default: "" },
  useCase:      { type: String, default: "" },
  demoLink:     { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.models.FeatureRelease || mongoose.model("FeatureRelease", s);
