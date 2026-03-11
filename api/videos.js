const { connectDB } = require("./lib/db");
const Video = require("./models/Video");
const { withCors, ok, created, noContent, badRequest, notFound, serverError } = require("./lib/helpers");

async function handler(req, res) {
  try {
    await connectDB();
    if (req.method === "GET") {
      const videos = await Video.find().sort({ createdAt: -1 }).lean();
      return ok(res, videos);
    }
    if (req.method === "POST") {
      const { title, videoUrl, description, category } = req.body;
      if (!title?.trim()) return badRequest(res, "Title is required.");
      if (!videoUrl?.trim()) return badRequest(res, "Video URL is required.");
      const video = await Video.create({ title, videoUrl, description, category });
      return created(res, video);
    }
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const updated = await Video.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return notFound(res, "Video not found.");
      return ok(res, updated);
    }
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");
      const deleted = await Video.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Video not found.");
      return noContent(res);
    }
    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
