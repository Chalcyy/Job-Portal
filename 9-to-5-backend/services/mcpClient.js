const logger = require("../utils/logger");

const MCP_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";

const fetchMcp = async (path, body) => {
  const response = await fetch(`${MCP_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `MCP request failed (${response.status})`);
  }

  return response.json();
};

const getChatContext = async (message) => {
  try {
    return await fetchMcp("/chat/context", { message });
  } catch (error) {
    logger.warn(`MCP context unavailable: ${error.message}`);
    return { jobs: [], companies: [], stats: {}, keywords: "" };
  }
};

const invokeTool = async (tool, args = {}) => {
  const { result } = await fetchMcp("/tools/invoke", { tool, args });
  return result;
};

module.exports = { getChatContext, invokeTool };
