import express from "express";
import { createWorkflowTrace } from "../services/traceService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("📥 Incoming payload:");
  console.dir(req.body, { depth: null });

  try {
    const result = await createWorkflowTrace(req.body);

    res.status(200).json({
      success: true,
      message: "Telemetry received",
      result,
    });

  } catch (error) {
    console.error("❌ Trace Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;