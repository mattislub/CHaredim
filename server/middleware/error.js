export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    console.error("Request error", {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error("Request error", err.message);
  }

  res.status(500).json({ error: "server_error" });
}
