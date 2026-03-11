const { connectDB } = require("./lib/db");
const FeatureRelease = require("./models/FeatureRelease");
const { withCors, ok, created, noContent, badRequest, notFound, serverError } = require("./lib/helpers");

async function handler(req, res) {
  try {
    await connectDB();
    if (req.method === "GET") {
      const features = await FeatureRelease.find().sort({ createdAt: -1 }).lean();
      return ok(res, features);
    }
    if (req.method === "POST") {
      const { featureName, description, releaseMonth, useCase, demoLink } = req.body;
      if (!featureName?.trim()) return badRequest(res, "Feature name is required.");
      const feature = await FeatureRelease.create({ featureName, description, releaseMonth, useCase, demoLink });
      return created(res, feature);
    }
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const updated = await FeatureRelease.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Feature not found.");
      return ok(res, updated);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await FeatureRelease.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Feature not found.");
      return noContent(res);
    }
    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
