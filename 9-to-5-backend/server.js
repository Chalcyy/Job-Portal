require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const candidateRoutes = require("./routes/candidateRoutes");
const companyRoutes = require("./routes/companyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, "uploads", "resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "9-to-5 API" });
});

app.use("/api/candidates", candidateRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`9-to-5 server running on port ${PORT}`);
});
