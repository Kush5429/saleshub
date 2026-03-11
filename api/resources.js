const { connectDB } = require("./lib/db");
const Resource = require("./models/Resource");
const { withCors, ok, created, noContent, badRequest, notFound, serverError } = require("./lib/helpers");

async function handler(req, res) {
  try {
    await connectDB();
    if (req.method === "GET") {
      const resources = await Resource.find().sort({ createdAt: -1 }).lean();
      return ok(res, resources);
    }
    if (req.method === "POST") {
      const { title, link, description, category } = req.body;
      if (!title?.trim()) return badRequest(res, "Title is required.");
      if (!link?.trim()) return badRequest(res, "Link is required.");
      const resource = await Resource.create({ title, link, description, category });
      return created(res, resource);
    }
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const updated = await Resource.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Resource not found.");
      return ok(res, updated);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await Resource.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Resource not found.");
      return noContent(res);
    }
    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
