const toWebUploadsPath = (rawPath) => {
  if (!rawPath) return rawPath;
  const normalized = String(rawPath).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith("uploads/")) return normalized;
  if (normalized.startsWith("/uploads/")) return normalized.slice(1);
  const idx = normalized.toLowerCase().indexOf("/uploads/");
  if (idx !== -1) return normalized.slice(idx + 1);
  const filename = normalized.split("/").pop();
  return `uploads/${filename}`;
};

const buildAbsoluteUrl = (req, imagePath) => {
  if (!imagePath) return imagePath;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const webRelative = toWebUploadsPath(imagePath);
  const withLeadingSlash = webRelative.startsWith("/") ? webRelative : `/${webRelative}`;
  return `${req.protocol}://${req.get("host")}${withLeadingSlash}`;
};

exports.normalizeImageUrls = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      if (body && typeof body === "object" && body.data) {
        const transform = (item) => {
          if (item && typeof item === "object" && typeof item.image === "string") {
            return { ...item, image: buildAbsoluteUrl(req, item.image) };
          }
          return item;
        };
        if (Array.isArray(body.data)) {
          body = { ...body, data: body.data.map(transform) };
        } else {
          body = { ...body, data: transform(body.data) };
        }
      }
    } catch (_) {
      // Best-effort transformation; ignore errors
    }
    return originalJson(body);
  };
  next();
};


