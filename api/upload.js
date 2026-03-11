const { withCors, ok, badRequest, serverError } = require("./lib/helpers");

exports.config = { api: { bodyParser: false } };

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed." });
  try {
    const formidable = require("formidable");
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const form = formidable({ maxFileSize: 20 * 1024 * 1024 });
    const [, files] = await new Promise((resolve, reject) =>
      form.parse(req, (err, fields, files) => err ? reject(err) : resolve([fields, files]))
    );
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return badRequest(res, "No file provided.");
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: "sales-hub", resource_type: "auto", use_filename: true, unique_filename: true,
    });
    return ok(res, { url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type, format: result.format, bytes: result.bytes });
  } catch (err) { return serverError(res, err); }
}

module.exports = withCors(handler);
