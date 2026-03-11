function withCors(handler) {
  return async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    return handler(req, res);
  };
}

const ok          = (res, data)    => res.status(200).json({ success: true, data });
const created     = (res, data)    => res.status(201).json({ success: true, data });
const noContent   = (res)          => res.status(200).json({ success: true });
const badRequest  = (res, msg)     => res.status(400).json({ success: false, error: msg });
const notFound    = (res, msg)     => res.status(404).json({ success: false, error: msg });
const serverError = (res, err)     => {
  console.error("[API Error]", err);
  return res.status(500).json({ success: false, error: err?.message ?? "Internal server error" });
};

module.exports = { withCors, ok, created, noContent, badRequest, notFound, serverError };
