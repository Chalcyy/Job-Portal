require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const {
  matchJobs,
  invokeTool,
  getChatContext,
} = require("./tools/portalTools");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "9-to-5 MCP Server" });
});

app.post("/match", async (req, res) => {
  try {
    const result = await matchJobs(req.body);
    res.json({ jobIds: result.jobIds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/tools/invoke", async (req, res) => {
  try {
    const { tool, args } = req.body;
    const result = await invokeTool(tool, args);
    res.json({ result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/chat/context", async (req, res) => {
  try {
    const { message } = req.body;
    const context = await getChatContext(message || "");
    res.json(context);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`9-to-5 MCP HTTP server running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start MCP server:", err.message);
  process.exit(1);
});
