const crypto = require("crypto");
const ChatSession = require("../models/ChatSession");
const { getChatContext } = require("./mcpClient");
const { chat: ollamaChat } = require("./ollamaService");
const logger = require("../utils/logger");

const WELCOME_MESSAGE =
  "Hi! I'm your 9-to-5 career assistant. Ask me about jobs, companies, remote roles, or how to apply — I pull live data from our MongoDB job portal.";

const getOrCreateSession = async (sessionId, userInfo) => {
  let session = await ChatSession.findOne({ sessionId });

  if (!session) {
    session = await ChatSession.create({
      sessionId,
      userId: userInfo?.id || null,
      userRole: userInfo?.role || "guest",
      userName: userInfo?.name || null,
      messages: [{ role: "assistant", content: WELCOME_MESSAGE }],
    });
  }

  return session;
};

const buildUserInfo = (req) => {
  if (req.candidate) {
    return { id: req.candidate._id, name: req.candidate.name, role: "candidate" };
  }
  if (req.company) {
    return { id: req.company._id, name: req.company.name, role: "company" };
  }
  return null;
};

const sendMessage = async (req) => {
  const { message, sessionId: incomingSessionId } = req.body;

  if (!message?.trim()) {
    throw new Error("Message is required");
  }

  const sessionId = incomingSessionId || crypto.randomUUID();
  const userInfo = buildUserInfo(req);

  const session = await getOrCreateSession(sessionId, userInfo);

  if (userInfo && !session.userId) {
    session.userId = userInfo.id;
    session.userRole = userInfo.role;
    session.userName = userInfo.name;
  }

  session.messages.push({ role: "user", content: message.trim() });

  const context = await getChatContext(message.trim());

  const recentMessages = session.messages
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }));

  let reply;
  try {
    reply = await   ({ messages: recentMessages, context, userInfo });
  } catch (error) {
    logger.error(`Ollama chat failed: ${error.message}`);
    reply =
      "I'm having trouble reaching the AI right now. Make sure Ollama is running (`ollama serve`) and the model is pulled (`ollama pull llama3.2`). You can still browse jobs on the site!";
  }

  session.messages.push({ role: "assistant", content: reply });
  await session.save();

  return {
    sessionId,
    reply,
    messages: session.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  };
};

const getHistory = async (sessionId) => {
  const session = await ChatSession.findOne({ sessionId });
  if (!session) {
    return { sessionId, messages: [{ role: "assistant", content: WELCOME_MESSAGE }] };
  }

  return {
    sessionId,
    messages: session.messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  };
};

const clearSession = async (sessionId) => {
  await ChatSession.findOneAndUpdate(
    { sessionId },
    {
      messages: [{ role: "assistant", content: WELCOME_MESSAGE }],
    },
    { upsert: true }
  );
  return { sessionId, messages: [{ role: "assistant", content: WELCOME_MESSAGE }] };
};

module.exports = { sendMessage, getHistory, clearSession, WELCOME_MESSAGE };
