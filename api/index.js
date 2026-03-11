import mongoose from "mongoose";

// ── Connection ────────────────────────────────────────────────
let cached = global._mongoConn || null;

async function connectDB() {
  if (cached?.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set.");
  if (!cached) { cached = { conn: null, promise: null }; global._mongoConn = cached; }
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  }
  try { cached.conn = await cached.promise; } catch (e) { cached.promise = null; throw e; }
  return cached.conn;
}

// ── Models ────────────────────────────────────────────────────
function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, new mongoose.Schema(schema, { timestamps: true }));
}

const Documentation  = model("Documentation",  { title: { type: String, required: true, trim: true }, description: { type: String, default: "" }, fileUrl: { type: String, default: "" }, category: { type: String, default: "Other", trim: true } });
const PricingPlan    = model("PricingPlan",     { name: { type: String, required: true, trim: true }, price: { type: String, required: true }, description: { type: String, default: "" }, features: { type: [String], default: [] }, limits: { type: String, default: "" }, icp: { type: String, default: "" } });
const Addon          = model("Addon",           { name: { type: String, required: true, trim: true }, description: { type: String, default: "" }, price: { type: String, required: true }, compatiblePlans: { type: String, default: "" } });
const Video          = model("Video",           { title: { type: String, required: true, trim: true }, videoUrl: { type: String, required: true }, description: { type: String, default: "" }, category: { type: String, default: "Demo", trim: true } });
const Resource       = model("Resource",        { title: { type: String, required: true, trim: true }, link: { type: String, required: true }, description: { type: String, default: "" }, category: { type: String, default: "Other", trim: true } });
const FeatureRelease = model("FeatureRelease",  { featureName: { type: String, required: true, trim: true }, description: { type: String, default: "" }, releaseMonth: { type: String, default: "" }, useCase: { type: String, default: "" }, demoLink: { type: String, default: "" } });

// ── Helpers ───────────────────────────────────────────────────
const ok          = (res, data) => res.status(200).json({ success: true, data });
const created     = (res, data) => res.status(201).json({ success: true, data });
const noContent   = (res)       => res.status(200).json({ success: true });
const badRequest  = (res, msg)  => res.status(400).json({ success: false, error: msg });
const notFound    = (res, msg)  => res.status(404).json({ success: false, error: msg });
const notAllowed  = (res)       => res.status(405).json({ success: false, error: "Method not allowed." });
const serverError = (res, err)  => { console.error("[API]", err?.message || err); return res.status(500).json({ success: false, error: err?.message || "Server error" }); };

// ── Route config ──────────────────────────────────────────────
const ROUTES = {
  docs:      { model: Documentation,  sort: { createdAt: -1 }, validate: b => !b.title?.trim()       ? "Title is required."        : null },
  pricing:   { model: PricingPlan,    sort: { createdAt:  1 }, validate: b => !b.name?.trim()        ? "Plan name is required."    : !b.price?.trim() ? "Price is required." : null, transform: b => ({ ...b, features: Array.isArray(b.features) ? b.features : (b.features||"").split(",").map(f=>f.trim()).filter(Boolean) }) },
  addons:    { model: Addon,          sort: { createdAt:  1 }, validate: b => !b.name?.trim()        ? "Name is required."         : !b.price?.trim() ? "Price is required." : null },
  videos:    { model: Video,          sort: { createdAt: -1 }, validate: b => !b.title?.trim()       ? "Title is required."        : !b.videoUrl?.trim() ? "Video URL is required." : null },
  resources: { model: Resource,       sort: { createdAt: -1 }, validate: b => !b.title?.trim()       ? "Title is required."        : !b.link?.trim() ? "Link is required." : null },
  features:  { model: FeatureRelease, sort: { createdAt: -1 }, validate: b => !b.featureName?.trim() ? "Feature name is required." : null },
};

// ── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw      = req.url || "";
  const resource = raw.split("?")[0].split("/").filter(Boolean).pop();
  const id       = req.query?.id;

  console.log(`[${req.method}] /${resource}${id ? `?id=${id}` : ""}`);

  const route = ROUTES[resource];
  if (!route) return res.status(404).json({ success: false, error: `Unknown: ${resource}` });

  try {
    await connectDB();
    const { model: Model, sort } = route;

    if (req.method === "GET")    return ok(res, await Model.find({}).sort(sort).lean());
    if (req.method === "POST") {
      const body = req.body || {};
      const err  = route.validate?.(body);
      if (err) return badRequest(res, err);
      return created(res, await Model.create(route.transform ? route.transform(body) : body));
    }
    if (req.method === "PUT") {
      if (!id) return badRequest(res, "ID required.");
      const body    = route.transform ? route.transform(req.body||{}) : (req.body||{});
      const updated = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      return updated ? ok(res, updated) : notFound(res, "Not found.");
    }
    if (req.method === "DELETE") {
      if (!id) return badRequest(res, "ID required.");
      const deleted = await Model.findByIdAndDelete(id);
      return deleted ? noContent(res) : notFound(res, "Not found.");
    }
    return notAllowed(res);
  } catch (err) { return serverError(res, err); }
}
