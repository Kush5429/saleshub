const { connectDB } = require("./lib/db");
const Addon = require("./models/Addon");
const { withCors, ok, created, noContent, badRequest, notFound, serverError } = require("./lib/helpers");

async function handler(req, res) {
  try {
    await connectDB();
    if (req.method === "GET") {
      const addons = await Addon.find().sort({ createdAt: 1 }).lean();
      return ok(res, addons);
    }
    if (req.method === "POST") {
      const { name, description, price, compatiblePlans } = req.body;
      if (!name?.trim()) return badRequest(res, "Name is required.");
      if (!price?.trim()) return badRequest(res, "Price is required.");
      const addon = await Addon.create({ name, description, price, compatiblePlans });
      return created(res, addon);
    }
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const updated = await Addon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Add-on not found.");
      return ok(res, updated);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await Addon.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Add-on not found.");
      return noContent(res);
    }
    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
