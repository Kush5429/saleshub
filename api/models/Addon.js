import mongoose from "mongoose";

const AddonSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true, trim: true },
    description:    { type: String, default: "" },
    price:          { type: String, required: true },
    compatiblePlans:{ type: String, default: "" }, // stored as comma-separated string for flexibility
  },
  { timestamps: true }
);

export default mongoose.models.Addon ||
  mongoose.model("Addon", AddonSchema);
