import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    link:        { type: String, required: true },
    description: { type: String, default: "" },
    category:    { type: String, default: "Other", trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema);
