/**
 * Wraps a serverless handler with CORS headers.
 * Vercel serverless functions receive (req, res) — this utility
 * sets appropriate headers and handles OPTIONS preflight.
 */
export function withCors(handler) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

export function ok(res, data) {
  return res.status(200).json({ success: true, data });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(200).json({ success: true });
}

export function badRequest(res, message = "Bad request") {
  return res.status(400).json({ success: false, error: message });
}

export function notFound(res, message = "Not found") {
  return res.status(404).json({ success: false, error: message });
}

export function serverError(res, err) {
  console.error("[API Error]", err);
  return res.status(500).json({
    success: false,
    error: err?.message ?? "Internal server error",
  });
}
