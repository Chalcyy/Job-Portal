const { sendMessage, uploadFile, getHistory, clearSession } = require("../services/chatbotService");
const { checkHealth } = require("../services/ollamaService");

const postMessage = async (req, res) => {
  try {
    const result = await sendMessage(req);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadChatbotFile = async (req, res) => {
  try {
    const result = await uploadFile(req);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await getHistory(sessionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await clearSession(sessionId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getChatStatus = async (req, res) => {
  const ollama = await checkHealth();
  res.json({
    chatbot: "9-to-5 Assistant",
    ollama,
    mcpUrl: process.env.MCP_SERVER_URL || "http://localhost:3001",
  });
};

module.exports = { postMessage, uploadChatbotFile, getChatHistory, resetChat, getChatStatus };
