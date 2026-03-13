import mongoose from "mongoose";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// ── DB Connection ─────────────────────────────────────────────
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

const User = model("User", {
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ["admin", "sales"], default: "sales" },
});

const EngagementEvent = model("EngagementEvent", {
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contentType: { type: String, required: true },   // docs | video | feature | resource | pricing
  contentId:   { type: String, required: true },
  eventType:   { type: String, required: true },   // view | open | play | click | demo_request
  timestamp:   { type: Date, default: Date.now },
});

const FeatureMetric = model("FeatureMetric", {
  featureId:    { type: mongoose.Schema.Types.ObjectId, ref: "FeatureRelease", required: true, unique: true },
  featureName:  { type: String, default: "" },
  views:        { type: Number, default: 0 },
  mentions:     { type: Number, default: 0 },
  demoRequests: { type: Number, default: 0 },
  lastUpdated:  { type: Date, default: Date.now },
});

// ── JWT helpers ───────────────────────────────────────────────
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "doubletick-dev-secret-change-in-prod");
const JWT_TTL    = "7d";

async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_TTL)
    .sign(JWT_SECRET);
}

async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch { return null; }
}

async function authUser(req) {
  const auth  = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

// ── Rate limiting (in-memory, resets on cold start) ───────────
const loginAttempts = new Map();
function isRateLimited(ip) {
  const now    = Date.now();
  const entry  = loginAttempts.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count > 10;
}

// ── Response helpers ──────────────────────────────────────────
const ok          = (res, data)  => res.status(200).json({ success: true, data });
const created     = (res, data)  => res.status(201).json({ success: true, data });
const noContent   = (res)        => res.status(200).json({ success: true });
const badRequest  = (res, msg)   => res.status(400).json({ success: false, error: msg });
const unauthorized= (res, msg)   => res.status(401).json({ success: false, error: msg || "Unauthorized" });
const forbidden   = (res)        => res.status(403).json({ success: false, error: "Forbidden. Admin only." });
const notFound    = (res, msg)   => res.status(404).json({ success: false, error: msg });
const notAllowed  = (res)        => res.status(405).json({ success: false, error: "Method not allowed." });
const serverError = (res, err)   => { console.error("[API]", err?.message || err); return res.status(500).json({ success: false, error: err?.message || "Server error" }); };

// ── CRUD config ───────────────────────────────────────────────
const CRUD_ROUTES = {
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
  const parts    = raw.split("?")[0].split("/").filter(Boolean);
  const resource = parts[parts.length - 1];
  const id       = req.query?.id;

  try {
    await connectDB();

    // ── AUTH: POST /api/auth/register ──────────────────────────
    if (resource === "register" && req.method === "POST") {
      const { name, email, password, role } = req.body || {};
      if (!name || !email || !password) return badRequest(res, "name, email, password required.");
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return badRequest(res, "Email already registered.");
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash, role: role === "admin" ? "admin" : "sales" });
      const token = await signToken({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name });
      return created(res, { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    // ── AUTH: POST /api/auth/login ─────────────────────────────
    if (resource === "login" && req.method === "POST") {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      if (isRateLimited(ip)) return res.status(429).json({ success: false, error: "Too many attempts. Try again in 60s." });
      const { email, password } = req.body || {};
      if (!email || !password) return badRequest(res, "email and password required.");
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return unauthorized(res, "Invalid credentials.");
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return unauthorized(res, "Invalid credentials.");
      const token = await signToken({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name });
      return ok(res, { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    // ── AUTH: GET /api/auth/me ─────────────────────────────────
    if (resource === "me" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const user = await User.findById(payload.sub).select("-passwordHash");
      if (!user) return notFound(res, "User not found.");
      return ok(res, { _id: user._id, name: user.name, email: user.email, role: user.role });
    }

    // ── SEARCH: GET /api/search?q= ─────────────────────────────
    if (resource === "search" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const q = (req.query?.q || "").trim();
      if (!q) return ok(res, { docs: [], features: [], videos: [], resources: [], pricing: [] });
      const rx = new RegExp(q, "i");
      const [docs, features, videos, resources, pricing] = await Promise.all([
        Documentation .find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        FeatureRelease.find({ $or: [{ featureName: rx }, { description: rx }, { useCase: rx }] }).limit(10).lean(),
        Video         .find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        Resource      .find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        PricingPlan   .find({ $or: [{ name: rx }, { icp: rx }] }).limit(10).lean(),
      ]);
      return ok(res, { docs, features, videos, resources, pricing });
    }

    // ── ENGAGEMENT: POST /api/engage ──────────────────────────
    if (resource === "engage" && req.method === "POST") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const { contentType, contentId, eventType } = req.body || {};
      if (!contentType || !contentId || !eventType) return badRequest(res, "contentType, contentId, eventType required.");
      await EngagementEvent.create({ userId: payload.sub, contentType, contentId, eventType });
      return ok(res, { tracked: true });
    }

    // ── INTELLIGENCE: GET /api/intelligence ───────────────────
    if (resource === "intelligence" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [topContent, recentEvents, featureMetrics, totalEvents, eventBreakdown] = await Promise.all([
        EngagementEvent.aggregate([
          { $match: { timestamp: { $gte: thirtyDaysAgo } } },
          { $group: { _id: { contentType: "$contentType", contentId: "$contentId" }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
        ]),
        EngagementEvent.find({}).sort({ timestamp: -1 }).limit(50).lean(),
        FeatureMetric.find({}).sort({ views: -1 }).lean(),
        EngagementEvent.countDocuments({}),
        EngagementEvent.aggregate([
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      // Group top content IDs by type
      const byType = { docs: [], video: [], feature: [], resource: [], pricing: [] };
      topContent.forEach(item => {
        const t = item._id.contentType;
        if (byType[t]) byType[t].push({ contentId: item._id.contentId, count: item.count });
      });

      // Resolve IDs → human-readable names via batch lookups
      const safeIds = (arr) => {
        return arr.map(i => i.contentId).filter(id => {
          try { new mongoose.Types.ObjectId(id); return true; } catch { return false; }
        }).map(id => new mongoose.Types.ObjectId(id));
      };

      const [docDocs, videoDocs, featDocs, resDocs, planDocs] = await Promise.all([
        byType.docs.length    ? Documentation .find({ _id: { $in: safeIds(byType.docs) } },    { title: 1 }).lean() : [],
        byType.video.length   ? Video         .find({ _id: { $in: safeIds(byType.video) } },   { title: 1 }).lean() : [],
        byType.feature.length ? FeatureRelease.find({ _id: { $in: safeIds(byType.feature) } }, { featureName: 1 }).lean() : [],
        byType.resource.length? Resource      .find({ _id: { $in: safeIds(byType.resource) } },{ title: 1 }).lean() : [],
        byType.pricing.length ? PricingPlan   .find({ _id: { $in: safeIds(byType.pricing) } }, { name: 1 }).lean() : [],
      ]);

      // Build ID → name maps
      const nameMap = {};
      docDocs  .forEach(d => { nameMap[d._id.toString()] = d.title; });
      videoDocs.forEach(d => { nameMap[d._id.toString()] = d.title; });
      featDocs .forEach(d => { nameMap[d._id.toString()] = d.featureName; });
      resDocs  .forEach(d => { nameMap[d._id.toString()] = d.title; });
      planDocs .forEach(d => { nameMap[d._id.toString()] = d.name; });

      // Attach names to top content
      Object.keys(byType).forEach(type => {
        byType[type] = byType[type].map(item => ({
          ...item,
          contentName: nameMap[item.contentId] || item.contentId,
        }));
      });

      // Enrich recent events with content names
      const enrichedEvents = recentEvents.map(ev => ({
        ...ev,
        contentName: nameMap[ev.contentId] || null,
      }));

      return ok(res, { topContent: byType, recentEvents: enrichedEvents, featureMetrics, totalEvents, eventBreakdown });
    }

    // ── FEATURE METRICS ────────────────────────────────────────
    if (resource === "feature-metrics") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);

      if (req.method === "GET") {
        const metrics = await FeatureMetric.find({}).sort({ views: -1 }).lean();
        return ok(res, metrics);
      }

      const action = parts[parts.length - 2]; // view | mention | demo
      const { featureId, featureName } = req.body || {};
      if (!featureId) return badRequest(res, "featureId required.");

      const inc = {};
      if (action === "view")    inc.views = 1;
      if (action === "mention") inc.mentions = 1;
      if (action === "demo")    { inc.demoRequests = 1; }

      const metric = await FeatureMetric.findOneAndUpdate(
        { featureId },
        { $inc: inc, $set: { lastUpdated: new Date(), featureName: featureName || "" } },
        { upsert: true, new: true }
      );

      // Also log engagement event
      await EngagementEvent.create({
        userId: payload.sub,
        contentType: "feature",
        contentId: featureId,
        eventType: action === "view" ? "view" : action === "demo" ? "demo_request" : "mention",
      });

      return ok(res, metric);
    }

    // ── CRUD routes ────────────────────────────────────────────
    const route = CRUD_ROUTES[resource];
    if (!route) return res.status(404).json({ success: false, error: `Unknown route: ${resource}` });

    const { model: Model, sort } = route;

    if (req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      return ok(res, await Model.find({}).sort(sort).lean());
    }

    if (req.method === "POST") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      if (payload.role !== "admin") return forbidden(res);
      const body = req.body || {};
      const err  = route.validate?.(body);
      if (err) return badRequest(res, err);
      return created(res, await Model.create(route.transform ? route.transform(body) : body));
    }

    if (req.method === "PUT") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      if (payload.role !== "admin") return forbidden(res);
      if (!id) return badRequest(res, "ID required.");
      const body    = route.transform ? route.transform(req.body||{}) : (req.body||{});
      const updated = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      return updated ? ok(res, updated) : notFound(res, "Not found.");
    }

    if (req.method === "DELETE") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      if (payload.role !== "admin") return forbidden(res);
      if (!id) return badRequest(res, "ID required.");
      const deleted = await Model.findByIdAndDelete(id);
      return deleted ? noContent(res) : notFound(res, "Not found.");
    }

    return notAllowed(res);

  } catch (err) { return serverError(res, err); }
}
