import mongoose from "mongoose";

const FeatureReleaseSchema = new mongoose.Schema(
  {
    featureName:  { type: String, required: true, trim: true },
    description:  { type: String, default: "" },
    releaseMonth: { type: String, default: "" },
    useCase:      { type: String, default: "" },
    demoLink:     { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.FeatureRelease ||
  mongoose.model("FeatureRelease", FeatureReleaseSchema);
