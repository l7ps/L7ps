import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadEnv } from "./env";
import { partnersRouter } from "./routes/partners";

const env = loadEnv();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false,
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/partners", partnersRouter);

app.listen(Number(env.PORT), () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});