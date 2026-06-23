const logger = require("../utils/logger");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const buildSystemPrompt = (context, userInfo, uploadedFile) => {
  const { jobs = [], companies = [], stats = {} } = context;

  const jobLines = jobs.length
    ? jobs
        .map(
          (j) =>
            `- ${j.title} at ${j.company} (${j.location}, ${j.jobType}) — skills: ${(j.skills || []).slice(0, 5).join(", ") || "N/A"}`
        )
        .join("\n")
    : "No specific jobs matched this message.";

  const companyLines = companies.length
    ? companies.map((c) => `- ${c.name} (${c.industry || "Industry N/A"}, ${c.location || "Location N/A"})`).join("\n")
    : "No specific companies matched this message.";

  const userLine = userInfo?.name
    ? `The user is logged in as ${userInfo.name} (${userInfo.role}).`
    : "The user is browsing as a guest.";

  let filePrompt = "";
  if (uploadedFile && uploadedFile.content) {
    filePrompt = `\nUser has uploaded a file named "${uploadedFile.name}". Here is the content of the file:\n"""\n${uploadedFile.content}\n"""\nUse this file content to answer the user's questions, review their resume, or extract details as requested.\n`;
  }

  return `You are 9-to-5 Assistant, a friendly career chatbot for the 9-to-5 job portal.
${userLine}
${filePrompt}
Use ONLY the live MongoDB portal data below when answering about jobs, companies, salaries, or openings.
If data is missing, say so honestly and suggest browsing the site or refining their search.
Keep answers concise, helpful, and conversational. Use bullet points for job lists.

Portal stats: ${stats.jobCount ?? 0} active jobs, ${stats.companyCount ?? 0} companies, ${stats.remoteCount ?? 0} remote roles.

Relevant jobs from MongoDB:
${jobLines}

Relevant companies from MongoDB:
${companyLines}

You can help with: finding jobs, explaining job types, career tips, how to apply on 9-to-5, and company info.`;
};

const chat = async ({ messages, context, userInfo, uploadedFile }) => {
  const systemPrompt = buildSystemPrompt(context, userInfo, uploadedFile);

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: false,
      options: { temperature: 0.7, num_predict: 512 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama error (${response.status}): ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.message?.content?.trim() || "Sorry, I couldn't generate a response.";
};

const checkHealth = async () => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) return { ok: false, model: OLLAMA_MODEL };
    const data = await response.json();
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some((m) => m === OLLAMA_MODEL || m.startsWith(`${OLLAMA_MODEL}:`));
    return { ok: hasModel, model: OLLAMA_MODEL, availableModels: models.slice(0, 5) };
  } catch (error) {
    logger.warn(`Ollama health check failed: ${error.message}`);
    return { ok: false, model: OLLAMA_MODEL, error: error.message };
  }
};

module.exports = { chat, checkHealth, OLLAMA_MODEL };
