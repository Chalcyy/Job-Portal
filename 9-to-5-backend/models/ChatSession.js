const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    userRole: { type: String, enum: ["candidate", "company", "guest"], default: "guest" },
    userName: String,
    messages: [messageSchema],
    uploadedFileName: String,
    uploadedFileText: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
