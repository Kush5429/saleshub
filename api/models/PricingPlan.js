import { connectDB } from "./lib/db.js";
import PricingPlan from "./models/PricingPlan.js";
import {
  withCors, ok, created, noContent, badRequest, notFound, serverError,
} from "./lib/helpers.js";

async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const plans = await PricingPlan.find().sort({ createdAt: 1 }).lean();
      return ok(res, plans);
    }

    if (req.method === "POST") {
      const { name, price, description, features, limits, icp } = req.body;
      if (!name?.trim()) return badRequest(res, "Plan name is required.");
      if (!price?.trim()) return badRequest(res, "Price is required.");

      // Accept features as either array or comma-separated string
      const featuresArr = Array.isArray(features)
        ? features
        : (features ?? "").split(",").map(f => f.trim()).filter(Boolean);

      const plan = await PricingPlan.create({ name, price, description, features: featuresArr, limits, icp });
      return created(res, plan);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");

      const body = { ...req.body };
      if (body.features && !Array.isArray(body.features)) {
        body.features = body.features.split(",").map(f => f.trim()).filter(Boolean);
      }

      const updated = await PricingPlan.findByIdAndUpdate(id, body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Plan not found.");
      return ok(res, updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");

      const deleted = await PricingPlan.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Plan not found.");
      return noContent(res);
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) {
    return serverError(res, err);
  }
}

export default withCors(handler);
