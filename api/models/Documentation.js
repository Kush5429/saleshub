const mongoose = require("mongoose");
const s = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  fileUrl:     { type: String, default: "" },
  category:    { type: String, default: "Other", trim: true },
}, { timestamps: true });
module.exports = mongoose.models.Documentation || mongoose.model("Documentation", s);
