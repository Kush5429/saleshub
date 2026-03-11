const { connectDB } = require("./lib/db");
const Documentation = require("./models/Documentation");
const { withCors, ok, created, noContent, badRequest, notFound, serverError } = require("./lib/helpers");

async function handler(req, res) {
  try {
    await connectDB();
    if (req.method === "GET") {
      const docs = await Documentation.find().sort({ createdAt: -1 }).lean();
      return ok(res, docs);
    }
    if (req.method === "POST") {
      const { title, description, fileUrl, category } = req.body;
      if (!title?.trim()) return badRequest(res, "Title is required.");
      const doc = await Documentation.create({ title, description, fileUrl, category });
      return created(res, doc);
    }
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const updated = await Documentation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Document not found.");
      return ok(res, updated);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await Documentation.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Document not found.");
      return noContent(res);
    }
    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
