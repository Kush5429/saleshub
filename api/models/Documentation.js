import { connectDB } from "./lib/db.js";
import Documentation from "./models/Documentation.js";
import {
  withCors, ok, created, noContent, badRequest, notFound, serverError,
} from "./lib/helpers.js";

async function handler(req, res) {
  try {
    await connectDB();

    // ── GET /api/docs ─────────────────────────────────────────────
    if (req.method === "GET") {
      const docs = await Documentation.find().sort({ createdAt: -1 }).lean();
      return ok(res, docs);
    }

    // ── POST /api/docs ────────────────────────────────────────────
    if (req.method === "POST") {
      const { title, description, fileUrl, category } = req.body;
      if (!title?.trim()) return badRequest(res, "Title is required.");

      const doc = await Documentation.create({ title, description, fileUrl, category });
      return created(res, doc);
    }

    // ── PUT /api/docs?id=:id ──────────────────────────────────────
    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");

      const updated = await Documentation.findByIdAndUpdate(id, req.body, {
        new: true, runValidators: true,
      });
      if (!updated) return notFound(res, "Document not found.");
      return ok(res, updated);
    }

    // ── DELETE /api/docs?id=:id ───────────────────────────────────
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return badRequest(res, "ID is required.");

      const deleted = await Documentation.findByIdAndDelete(id);
      if (!deleted) return notFound(res, "Document not found.");
      return noContent(res);
    }

    return res.status(405).json({ success: false, error: "Method not allowed." });
  } catch (err) {
    return serverError(res, err);
  }
}

export default withCors(handler);
