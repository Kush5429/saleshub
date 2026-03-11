const mongoose = require("mongoose");
const s = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  price:       { type: String, required: true },
  description: { type: String, default: "" },
  features:    { type: [String], default: [] },
  limits:      { type: String, default: "" },
  icp:         { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.models.PricingPlan || mongoose.model("PricingPlan", s);
