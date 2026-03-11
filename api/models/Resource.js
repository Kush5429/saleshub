const mongoose = require("mongoose");
const s = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  link:        { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, default: "Other", trim: true },
}, { timestamps: true });
module.exports = mongoose.models.Resource || mongoose.model("Resource", s);
