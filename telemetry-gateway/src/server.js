import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import telemetryRouter from "./routes/telemetry.js";
import { startTelemetry } from "./config/telemetry.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

await startTelemetry();

app.get("/", (req, res) => {
  res.json({
    service: "Telemetry Gateway",
    status: "Running",
  });
});

app.use("/telemetry", telemetryRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Gateway running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  process.exit(0);
});