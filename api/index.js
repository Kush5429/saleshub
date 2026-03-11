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

// ── Generic CRUD handler ──────────────────────────────────────
async function crudHandler(req, res, Model, validators = {}) {
  const { id } = req.query;
  const method  = req.method;

  if (method === "GET") {
    const sort = Model.modelName === "PricingPlan" ? { createdAt: 1 } : { createdAt: -1 };
    const docs = await Model.find().sort(sort).lean();
    return ok(res, docs);
  }

  if (method === "POST") {
    const { error, body } = validators.create ? validators.create(req.body) : { body: req.body };
    if (error) return badRequest(res, error);
    const doc = await Model.create(body);
    return created(res, doc);
  }

  if (method === "PUT") {
    if (!id) return badRequest(res, "ID is required.");
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return notFound(res, "Record not found.");
    return ok(res, updated);
  }

  if (method === "DELETE") {
    if (!id) return badRequest(res, "ID is required.");
    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return notFound(res, "Record not found.");
    return noContent(res);
  }

  return notAllowed(res);
}

// ── Route map ─────────────────────────────────────────────────
const ROUTES = {
  docs: {
    model: Documentation,
    validators: {
      create: (body) => {
        if (!body.title?.trim()) return { error: "Title is required." };
        return { body };
      },
    },
  },
  pricing: {
    model: PricingPlan,
    validators: {
      create: (body) => {
        if (!body.name?.trim())  return { error: "Plan name is required." };
        if (!body.price?.trim()) return { error: "Price is required." };
        const features = Array.isArray(body.features)
          ? body.features
          : (body.features ?? "").split(",").map(f => f.trim()).filter(Boolean);
        return { body: { ...body, features } };
      },
    },
  },
  addons: {
    model: Addon,
    validators: {
      create: (body) => {
        if (!body.name?.trim())  return { error: "Name is required." };
        if (!body.price?.trim()) return { error: "Price is required." };
        return { body };
      },
    },
  },
  videos: {
    model: Video,
    validators: {
      create: (body) => {
        if (!body.title?.trim())    return { error: "Title is required." };
        if (!body.videoUrl?.trim()) return { error: "Video URL is required." };
        return { body };
      },
    },
  },
  resources: {
    model: Resource,
    validators: {
      create: (body) => {
        if (!body.title?.trim()) return { error: "Title is required." };
        if (!body.link?.trim())  return { error: "Link is required." };
        return { body };
      },
    },
  },
  features: {
    model: FeatureRelease,
    validators: {
      create: (body) => {
        if (!body.featureName?.trim()) return { error: "Feature name is required." };
        return { body };
      },
    },
  },
};

// ── Main handler ──────────────────────────────────────────────
async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Route: /api/[resource] or /api/[resource]?id=...
  // req.query.resource is injected by vercel.json rewrite
  const resource = req.query.resource;

  if (!resource || !ROUTES[resource]) {
    return res.status(404).json({ success: false, error: `Unknown route: /api/${resource}` });
  }

  try {
    await connectDB();
    const { model, validators } = ROUTES[resource];
    return await crudHandler(req, res, model, validators);
  } catch (err) {
    return serverError(res, err);
  }
}

module.exports = handler;
