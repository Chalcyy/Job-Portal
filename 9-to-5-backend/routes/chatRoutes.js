const express = require("express");
const { optionalAuth } = require("../middleware/optionalAuth");
const {
  postMessage,
  uploadChatbotFile,
  getChatHistory,
  resetChat,
  getChatStatus,
} = require("../controllers/chatController");
const { uploadChatFile } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/status", getChatStatus);
router.post("/message", optionalAuth, postMessage);
router.post("/upload", optionalAuth, uploadChatFile.single("file"), uploadChatbotFile);
router.get("/history/:sessionId", getChatHistory);
router.delete("/history/:sessionId", resetChat);

module.exports = router;
