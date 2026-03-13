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

// ── Model factory ─────────────────────────────────────────────
function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, new mongoose.Schema(schema, { timestamps: true }));
}

// ── Existing Models ───────────────────────────────────────────
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
  contentType: { type: String, required: true },
  contentId:   { type: String, required: true },
  eventType:   { type: String, required: true },
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

// ── Phase 4 Models ────────────────────────────────────────────
const AIQuery = model("AIQuery", {
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question:  { type: String, required: true },
  response:  { type: String, default: "" },
  sources:   { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const DealInsight = model("DealInsight", {
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transcript:        { type: String, required: true },
  featuresMentioned: { type: [String], default: [] },
  objections:        { type: [String], default: [] },
  interests:         { type: [String], default: [] },
  nextSteps:         { type: [String], default: [] },
  createdAt:         { type: Date, default: Date.now },
});

const ContentRelation = model("ContentRelation", {
  sourceType:   { type: String, required: true },
  sourceId:     { type: String, required: true },
  targetType:   { type: String, required: true },
  targetId:     { type: String, required: true },
  relationType: { type: String, default: "related" },
});

// ── JWT helpers ───────────────────────────────────────────────
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "doubletick-dev-secret-change-in-prod");
const JWT_TTL    = "7d";

async function signToken(payload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(JWT_TTL).sign(JWT_SECRET);
}
async function verifyToken(token) {
  try { const { payload } = await jwtVerify(token, JWT_SECRET); return payload; } catch { return null; }
}
async function authUser(req) {
  const auth  = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

// ── Rate limiting ──────────────────────────────────────────────
const loginAttempts = new Map();
function isRateLimited(ip) {
  const now   = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000; }
  entry.count++;
  loginAttempts.set(ip, entry);
  return entry.count > 10;
}

// ── LLM: Gemini (primary, free tier) ─────────────────────────
async function callGemini(system, userMsg, retries = 2) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured.");
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMsg }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
      }),
    }
  );
  if (r.status === 429 && retries > 0) {
    await new Promise(res => setTimeout(res, 3000));
    return callGemini(system, userMsg, retries - 1);
  }
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `Gemini API error (${r.status})`);
  return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ── LLM: Anthropic (fallback) ─────────────────────────────────
async function callAnthropic(system, userMsg) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured.");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1024, system, messages: [{ role: "user", content: userMsg }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || "Anthropic API error");
  return d.content?.[0]?.text || "";
}

// ── LLM router: Gemini first, Anthropic fallback ──────────────
async function callClaude(system, userMsg) {
  if (process.env.GEMINI_API_KEY) return callGemini(system, userMsg);
  if (process.env.ANTHROPIC_API_KEY) return callAnthropic(system, userMsg);
  throw new Error("No LLM API key configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY in Vercel environment variables.");
}

// ── Response helpers ──────────────────────────────────────────
const ok          = (res, data) => res.status(200).json({ success: true, data });
const created     = (res, data) => res.status(201).json({ success: true, data });
const noContent   = (res)       => res.status(200).json({ success: true });
const badRequest  = (res, msg)  => res.status(400).json({ success: false, error: msg });
const unauthorized= (res, msg)  => res.status(401).json({ success: false, error: msg || "Unauthorized" });
const forbidden   = (res)       => res.status(403).json({ success: false, error: "Forbidden. Admin only." });
const notFound    = (res, msg)  => res.status(404).json({ success: false, error: msg });
const notAllowed  = (res)       => res.status(405).json({ success: false, error: "Method not allowed." });
const serverError = (res, err)  => { console.error("[API]", err?.message || err); return res.status(500).json({ success: false, error: err?.message || "Server error" }); };

// ── CRUD config ───────────────────────────────────────────────
const CRUD_ROUTES = {
  docs:      { model: Documentation,  sort: { createdAt: -1 }, validate: b => !b.title?.trim() ? "Title is required." : null },
  pricing:   { model: PricingPlan,    sort: { createdAt:  1 }, validate: b => !b.name?.trim() ? "Plan name is required." : !b.price?.trim() ? "Price is required." : null, transform: b => ({ ...b, features: Array.isArray(b.features) ? b.features : (b.features||"").split(",").map(f=>f.trim()).filter(Boolean) }) },
  addons:    { model: Addon,          sort: { createdAt:  1 }, validate: b => !b.name?.trim() ? "Name is required." : !b.price?.trim() ? "Price is required." : null },
  videos:    { model: Video,          sort: { createdAt: -1 }, validate: b => !b.title?.trim() ? "Title is required." : !b.videoUrl?.trim() ? "Video URL is required." : null },
  resources: { model: Resource,       sort: { createdAt: -1 }, validate: b => !b.title?.trim() ? "Title is required." : !b.link?.trim() ? "Link is required." : null },
  features:  { model: FeatureRelease, sort: { createdAt: -1 }, validate: b => !b.featureName?.trim() ? "Feature name is required." : null },
};

// ── Main Handler ──────────────────────────────────────────────
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

    // ── AUTH ──────────────────────────────────────────────────
    if (resource === "register" && req.method === "POST") {
      const { name, email, password, role } = req.body || {};
      if (!name || !email || !password) return badRequest(res, "name, email, password required.");
      if (await User.findOne({ email: email.toLowerCase() })) return badRequest(res, "Email already registered.");
      const passwordHash = await bcrypt.hash(password, 12);
      const user  = await User.create({ name, email, passwordHash, role: role === "admin" ? "admin" : "sales" });
      const token = await signToken({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name });
      return created(res, { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    if (resource === "login" && req.method === "POST") {
      const ip = req.headers["x-forwarded-for"] || "unknown";
      if (isRateLimited(ip)) return res.status(429).json({ success: false, error: "Too many attempts. Try again in 60s." });
      const { email, password } = req.body || {};
      if (!email || !password) return badRequest(res, "email and password required.");
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return unauthorized(res, "Invalid credentials.");
      if (!await bcrypt.compare(password, user.passwordHash)) return unauthorized(res, "Invalid credentials.");
      const token = await signToken({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name });
      return ok(res, { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    }

    if (resource === "me" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const user = await User.findById(payload.sub).select("-passwordHash");
      if (!user) return notFound(res, "User not found.");
      return ok(res, { _id: user._id, name: user.name, email: user.email, role: user.role });
    }

    // ── SEARCH ────────────────────────────────────────────────
    if (resource === "search" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const q = (req.query?.q || "").trim();
      if (!q) return ok(res, { docs: [], features: [], videos: [], resources: [], pricing: [] });
      const rx = new RegExp(q, "i");
      const [docs, features, videos, resources, pricing] = await Promise.all([
        Documentation.find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        FeatureRelease.find({ $or: [{ featureName: rx }, { description: rx }, { useCase: rx }] }).limit(10).lean(),
        Video.find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        Resource.find({ $or: [{ title: rx }, { description: rx }, { category: rx }] }).limit(10).lean(),
        PricingPlan.find({ $or: [{ name: rx }, { icp: rx }] }).limit(10).lean(),
      ]);
      return ok(res, { docs, features, videos, resources, pricing });
    }

    // ── ENGAGEMENT ────────────────────────────────────────────
    if (resource === "engage" && req.method === "POST") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const { contentType, contentId, eventType } = req.body || {};
      if (!contentType || !contentId || !eventType) return badRequest(res, "contentType, contentId, eventType required.");
      await EngagementEvent.create({ userId: payload.sub, contentType, contentId, eventType });
      return ok(res, { tracked: true });
    }

    // ── INTELLIGENCE ──────────────────────────────────────────
    if (resource === "intelligence" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [topContent, recentEvents, featureMetrics, totalEvents, eventBreakdown] = await Promise.all([
        EngagementEvent.aggregate([{ $match: { timestamp: { $gte: thirtyDaysAgo } } }, { $group: { _id: { contentType: "$contentType", contentId: "$contentId" }, count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
        EngagementEvent.find({}).sort({ timestamp: -1 }).limit(50).lean(),
        FeatureMetric.find({}).sort({ views: -1 }).lean(),
        EngagementEvent.countDocuments({}),
        EngagementEvent.aggregate([{ $group: { _id: "$eventType", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      ]);
      const byType = { docs: [], video: [], feature: [], resource: [], pricing: [] };
      topContent.forEach(item => { const t = item._id.contentType; if (byType[t]) byType[t].push({ contentId: item._id.contentId, count: item.count }); });
      const safeIds = arr => arr.map(i => i.contentId).filter(cid => { try { new mongoose.Types.ObjectId(cid); return true; } catch { return false; } }).map(cid => new mongoose.Types.ObjectId(cid));
      const [dD, vD, fD, rD, pD] = await Promise.all([
        byType.docs.length    ? Documentation.find({ _id: { $in: safeIds(byType.docs) } }, { title: 1 }).lean() : [],
        byType.video.length   ? Video.find({ _id: { $in: safeIds(byType.video) } }, { title: 1 }).lean() : [],
        byType.feature.length ? FeatureRelease.find({ _id: { $in: safeIds(byType.feature) } }, { featureName: 1 }).lean() : [],
        byType.resource.length? Resource.find({ _id: { $in: safeIds(byType.resource) } }, { title: 1 }).lean() : [],
        byType.pricing.length ? PricingPlan.find({ _id: { $in: safeIds(byType.pricing) } }, { name: 1 }).lean() : [],
      ]);
      const nm = {};
      dD.forEach(d => { nm[d._id.toString()] = d.title; });
      vD.forEach(d => { nm[d._id.toString()] = d.title; });
      fD.forEach(d => { nm[d._id.toString()] = d.featureName; });
      rD.forEach(d => { nm[d._id.toString()] = d.title; });
      pD.forEach(d => { nm[d._id.toString()] = d.name; });
      Object.keys(byType).forEach(t => { byType[t] = byType[t].map(item => ({ ...item, contentName: nm[item.contentId] || item.contentId })); });
      return ok(res, { topContent: byType, recentEvents: recentEvents.map(ev => ({ ...ev, contentName: nm[ev.contentId] || null })), featureMetrics, totalEvents, eventBreakdown });
    }

    // ── FEATURE METRICS ───────────────────────────────────────
    if (resource === "feature-metrics") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      if (req.method === "GET") return ok(res, await FeatureMetric.find({}).sort({ views: -1 }).lean());
      const action = parts[parts.length - 2];
      const { featureId, featureName } = req.body || {};
      if (!featureId) return badRequest(res, "featureId required.");
      const inc = {};
      if (action === "view")    inc.views = 1;
      if (action === "mention") inc.mentions = 1;
      if (action === "demo")    inc.demoRequests = 1;
      const metric = await FeatureMetric.findOneAndUpdate(
        { featureId },
        { $inc: inc, $set: { lastUpdated: new Date(), featureName: featureName || "" } },
        { upsert: true, new: true }
      );
      await EngagementEvent.create({ userId: payload.sub, contentType: "feature", contentId: featureId, eventType: action === "view" ? "view" : action === "demo" ? "demo_request" : "mention" });
      return ok(res, metric);
    }

    // ── AI PLAYBOOK ───────────────────────────────────────────
    if (resource === "ai-playbook" && req.method === "POST") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const { question } = req.body || {};
      if (!question?.trim()) return badRequest(res, "question is required.");
      const words = question.split(" ").filter(w => w.length > 3).slice(0, 6);
      const rx = words.length ? new RegExp(words.join("|"), "i") : new RegExp(question.slice(0, 20), "i");
      const [docs, features, videos, resources, pricing] = await Promise.all([
        Documentation.find({ $or: [{ title: rx }, { description: rx }] }).limit(4).lean(),
        FeatureRelease.find({ $or: [{ featureName: rx }, { description: rx }, { useCase: rx }] }).limit(4).lean(),
        Video.find({ $or: [{ title: rx }, { description: rx }] }).limit(3).lean(),
        Resource.find({ $or: [{ title: rx }, { description: rx }] }).limit(3).lean(),
        PricingPlan.find({ $or: [{ name: rx }, { icp: rx }, { description: rx }] }).limit(3).lean(),
      ]);
      const lines = [
        docs.length     ? "DOCUMENTATION:\n" + docs.map(d => "- " + d.title + ": " + d.description).join("\n") : "",
        features.length ? "FEATURES:\n" + features.map(f => "- " + f.featureName + " (" + f.releaseMonth + "): " + f.description + ". Use case: " + f.useCase).join("\n") : "",
        videos.length   ? "VIDEOS:\n" + videos.map(v => "- " + v.title + ": " + v.description).join("\n") : "",
        resources.length? "RESOURCES:\n" + resources.map(r => "- " + r.title + ": " + r.description).join("\n") : "",
        pricing.length  ? "PRICING:\n" + pricing.map(p => "- " + p.name + " at " + p.price + ". Best for: " + p.icp).join("\n") : "",
      ].filter(Boolean);
      const ctx = lines.join("\n\n") || "No specific context found.";
      const system = "You are an expert internal sales assistant for DoubleTick, a WhatsApp Business API platform. Help sales reps with concise, practical answers. Use markdown formatting. Ground your answer in the knowledge base.\n\nKNOWLEDGE BASE:\n" + ctx;
      const answer = await callClaude(system, question);
      await AIQuery.create({ userId: payload.sub, question, response: answer, sources: { docs, features, videos, resources, pricing } });
      return ok(res, { answer, sources: { docs, features, videos, resources, pricing } });
    }

    // ── AI QUERY HISTORY ──────────────────────────────────────
    if (resource === "ai-queries" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const filter = payload.role === "admin" ? {} : { userId: payload.sub };
      return ok(res, await AIQuery.find(filter).sort({ createdAt: -1 }).limit(50).lean());
    }

    // ── CALL INTELLIGENCE ─────────────────────────────────────
    if (resource === "call-intelligence" && req.method === "POST") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const { transcript } = req.body || {};
      if (!transcript?.trim()) return badRequest(res, "transcript is required.");
      const allFeatures = await FeatureRelease.find({}, { featureName: 1 }).lean();
      const featureList = allFeatures.map(f => f.featureName).join(", ");
      const system = "You are a sales call intelligence analyzer for DoubleTick (WhatsApp Business API). Analyze the transcript and extract structured insights. Known product features: " + featureList + ". Respond ONLY with valid JSON (no markdown, no backticks) in this exact format: {\"featuresMentioned\":[],\"objections\":[],\"interests\":[],\"nextSteps\":[]}";
      const raw = await callClaude(system, "Analyze this transcript:\n\n" + transcript);
      let parsed;
      try {
        const clean = raw.replace(/^[\s\S]*?\{/, "{").replace(/\}[\s\S]*$/, "}");
        parsed = JSON.parse(clean);
      } catch {
        parsed = { featuresMentioned: [], objections: [], interests: [], nextSteps: ["Could not parse AI response. Please try again."] };
      }
      await DealInsight.create({ userId: payload.sub, transcript, ...parsed });
      return ok(res, parsed);
    }

    // ── DEAL INSIGHTS HISTORY ─────────────────────────────────
    if (resource === "deal-insights" && req.method === "GET") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);
      const filter = payload.role === "admin" ? {} : { userId: payload.sub };
      return ok(res, await DealInsight.find(filter).sort({ createdAt: -1 }).limit(50).lean());
    }

    // ── CONTENT RELATIONS ─────────────────────────────────────
    if (resource === "relations") {
      const payload = await authUser(req);
      if (!payload) return unauthorized(res);

      if (req.method === "GET") {
        const { sourceType, sourceId } = req.query || {};
        if (!sourceType || !sourceId) return badRequest(res, "sourceType and sourceId required.");
        const relations = await ContentRelation.find({ sourceType, sourceId }).lean();
        const enriched = await Promise.all(relations.map(async rel => {
          let name = rel.targetId;
          try {
            const oid = new mongoose.Types.ObjectId(rel.targetId);
            const modelMap = { docs: Documentation, video: Video, feature: FeatureRelease, resource: Resource, pricing: PricingPlan };
            const M = modelMap[rel.targetType];
            if (M) {
              const doc = await M.findById(oid).select("title featureName name").lean();
              if (doc) name = doc.title || doc.featureName || doc.name || rel.targetId;
            }
          } catch {}
          return { ...rel, targetName: name };
        }));
        return ok(res, enriched);
      }

      if (req.method === "POST") {
        if (payload.role !== "admin") return forbidden(res);
        const { sourceType, sourceId, targetType, targetId, relationType } = req.body || {};
        if (!sourceType || !sourceId || !targetType || !targetId) return badRequest(res, "sourceType, sourceId, targetType, targetId required.");
        const existing = await ContentRelation.findOne({ sourceType, sourceId, targetType, targetId });
        if (existing) return badRequest(res, "Relation already exists.");
        const rel = await ContentRelation.create({ sourceType, sourceId, targetType, targetId, relationType: relationType || "related" });
        return created(res, rel);
      }

      if (req.method === "DELETE") {
        if (payload.role !== "admin") return forbidden(res);
        if (!id) return badRequest(res, "ID required.");
        const deleted = await ContentRelation.findByIdAndDelete(id);
        return deleted ? noContent(res) : notFound(res, "Relation not found.");
      }

      return notAllowed(res);
    }

    // ── CRUD routes ───────────────────────────────────────────
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
