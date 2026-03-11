const mongoose = require("mongoose");

// ── Connection ────────────────────────────────────────────────
let cached = global._mongoConn ?? null;

async function connectDB() {
  if (cached?.conn) return cached.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  if (!cached) { cached = { conn: null, promise: null }; global._mongoConn = cached; }
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false, maxPoolSize: 10 }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Models ────────────────────────────────────────────────────
const Documentation = mongoose.models.Documentation || mongoose.model("Documentation", new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  category: { type: String, default: "Other", trim: true },
}, { timestamps: true }));

const PricingPlan = mongoose.models.PricingPlan || mongoose.model("PricingPlan", new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  description: { type: String, default: "" },
  features: { type: [String], default: [] },
  limits: { type: String, default: "" },
  icp: { type: String, default: "" },
}, { timestamps: true }));

const Addon = mongoose.models.Addon || mongoose.model("Addon", new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: String, required: true },
  compatiblePlans: { type: String, default: "" },
}, { timestamps: true }));

const Video = mongoose.models.Video || mongoose.model("Video", new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "Demo", trim: true },
}, { timestamps: true }));

const Resource = mongoose.models.Resource || mongoose.model("Resource", new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  link: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "Other", trim: true },
}, { timestamps: true }));

const FeatureRelease = mongoose.models.FeatureRelease || mongoose.model("FeatureRelease", new mongoose.Schema({
  featureName: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  releaseMonth: { type: String, default: "" },
  useCase: { type: String, default: "" },
  demoLink: { type: String, default: "" },
}, { timestamps: true }));

// ── Response helpers ──────────────────────────────────────────
const ok         = (res, data) => res.status(200).json({ success: true, data });
const created    = (res, data) => res.status(201).json({ success: true, data });
const noContent  = (res)       => res.status(200).json({ success: true });
const badRequest = (res, msg)  => res.status(400).json({ success: false, error: msg });
const notFound   = (res, msg)  => res.status(404).json({ success: false, error: msg });
const serverError = (res, err) => { console.error("[API]", err); return res.status(500).json({ success: false, error: err?.message ?? "Server error" }); };
const notAllowed  = (res)      => res.status(405).json({ success: false, error: "Method not allowed." });

