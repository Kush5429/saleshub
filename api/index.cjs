const mongoose = require("mongoose");

// ── MongoDB Connection ────────────────────────────────────────
let cached = global._mongoConn || null;

async function connectDB() {
  if (cached && cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");

  if (!cached) {
    cached = { conn: null, promise: null };
    global._mongoConn = cached;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ── Models ────────────────────────────────────────────────────
function getModel(name, schema) {
  return mongoose.models[name] || mongoose.model(name, new mongoose.Schema(schema, { timestamps: true }));
}

const Documentation = getModel("Documentation", {
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  fileUrl:     { type: String, default: "" },
  category:    { type: String, default: "Other", trim: true },
});

const PricingPlan = getModel("PricingPlan", {
  name:        { type: String, required: true, trim: true },
  price:       { type: String, required: true },
  description: { type: String, default: "" },
  features:    { type: [String], default: [] },
  limits:      { type: String, default: "" },
  icp:         { type: String, default: "" },
});

const Addon = getModel("Addon", {
  name:            { type: String, required: true, trim: true },
  description:     { type: String, default: "" },
  price:           { type: String, required: true },
  compatiblePlans: { type: String, default: "" },
});

const Video = getModel("Video", {
  title:       { type: String, required: true, trim: true },
  videoUrl:    { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, default: "Demo", trim: true },
});

const Resource = getModel("Resource", {
  title:       { type: String, required: true, trim: true },
  link:        { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, default: "Other", trim: true },
});

const FeatureRelease = getModel("FeatureRelease", {
  featureName:  { type: String, required: true, trim: true },
  description:  { type: String, default: "" },
  releaseMonth: { type: String, default: "" },
  useCase:      { type: String, default: "" },
  demoLink:     { type: String, default: "" },
});

// ── Helpers ───────────────────────────────────────────────────
const ok          = (res, data) => res.status(200).json({ success: true, data });
const created     = (res, data) => res.status(201).json({ success: true, data });
const noContent   = (res)       => res.status(200).json({ success: true });
const badRequest  = (res, msg)  => res.status(400).json({ success: false, error: msg });
const notFound    = (res, msg)  => res.status(404).json({ success: false, error: msg });
const notAllowed  = (res)       => res.status(405).json({ success: false, error: "Method not allowed." });
const serverError = (res, err)  => {
  console.error("[API Error]", err?.message || err);
  return res.status(500).json({ success: false, error: err?.message || "Server error" });
};

// ── Routes ────────────────────────────────────────────────────
const ROUTES = {
  docs: {
    model: Documentation,
    sort: { createdAt: -1 },
    validate: (b) => !b.title?.trim() ? "Title is required." : null,
  },
  pricing: {
    model: PricingPlan,
    sort: { createdAt: 1 },
    validate: (b) => !b.name?.trim() ? "Plan name is required." : !b.price?.trim() ? "Price is required." : null,
    transform: (b) => ({ ...b, features: Array.isArray(b.features) ? b.features : (b.features || "").split(",").map(f => f.trim()).filter(Boolean) }),
  },
  addons: {
    model: Addon,
    sort: { createdAt: 1 },
    validate: (b) => !b.name?.trim() ? "Name is required." : !b.price?.trim() ? "Price is required." : null,
  },
  videos: {
    model: Video,
    sort: { createdAt: -1 },
    validate: (b) => !b.title?.trim() ? "Title is required." : !b.videoUrl?.trim() ? "Video URL is required." : null,
  },
  resources: {
    model: Resource,
    sort: { createdAt: -1 },
    validate: (b) => !b.title?.trim() ? "Title is required." : !b.link?.trim() ? "Link is required." : null,
  },
  features: {
    model: FeatureRelease,
    sort: { createdAt: -1 },
    validate: (b) => !b.featureName?.trim() ? "Feature name is required." : null,
  },
};

// ── Main Handler ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Parse resource from URL — handles /api/docs, /api/docs?id=x
  const raw      = req.url || "";
  const pathname = raw.split("?")[0];                   // "/api/docs"
  const segments = pathname.split("/").filter(Boolean); // ["api","docs"]
  const resource = segments[segments.length - 1];       // "docs"

  console.log(`[${req.method}] resource="${resource}" url="${raw}"`);

  const route = ROUTES[resource];
  if (!route) {
    return res.status(404).json({ success: false, error: `Unknown resource: "${resource}". URL: ${raw}` });
  }

  const id = req.query && req.query.id;

  try {
    await connectDB();
    const { model, sort } = route;

    if (req.method === "GET") {
      const docs = await model.find({}).sort(sort).lean();
      return ok(res, docs);
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const err  = route.validate ? route.validate(body) : null;
      if (err) return badRequest(res, err);
      const data = route.transform ? route.transform(body) : body;
      const doc  = await model.create(data);
      return created(res, doc);
    }

    if (req.method === "PUT") {
      if (!id) return badRequest(res, "ID is required.");
      const body    = route.transform ? route.transform(req.body || {}) : (req.body || {});
      const updated = await model.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Record not found.");
      return ok(res, updated);
    }

    if (req.method === "DELETE") {
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await model.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Record not found.");
      return noContent(res);
    }

    return notAllowed(res);

  } catch (err) {
    return serverError(res, err);
  }
};
