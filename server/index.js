import "dotenv/config";
import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts.js";
import galleriesRouter from "./routes/galleries.js";
import communitiesRouter from "./routes/communities.js";
import { query } from "./db.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const port = process.env.PORT || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN;
const isDev = process.env.NODE_ENV !== "production";

app.disable("x-powered-by");

app.use(
  cors({
    origin: frontendOrigin || false,
    credentials: false,
  })
);
app.use(express.json({ type: "application/json" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (isDev) {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    } else {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
    }
  });
  next();
});

app.get("/api/health", async (req, res, next) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, time: new Date().toISOString(), db: "ok" });
  } catch (err) {
    next(err);
  }
});

app.use("/api", postsRouter);
app.use("/api/galleries", galleriesRouter);
app.use("/api/communities", communitiesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
