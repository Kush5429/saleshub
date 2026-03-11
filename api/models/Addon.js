const mongoose = require("mongoose");
const s = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  description:     { type: String, default: "" },
  price:           { type: String, required: true },
  compatiblePlans: { type: String, default: "" },
}, { timestamps: true });
module.exports = mongoose.models.Addon || mongoose.model("Addon", s);
