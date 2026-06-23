require("dotenv").config();
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const connectDB = require("./db");
const {
  searchJobs,
  matchJobs,
  searchCompanies,
  getPortalStats,
  getChatContext,
} = require("./tools/portalTools");

const server = new McpServer({
  name: "9-to-5-portal",
  version: "1.0.0",
});

server.tool(
  "search_jobs",
  "Search active job listings in MongoDB by keywords, location, skills, or job type",
  {
    search: z.string().optional().describe("Keywords to search in title, description, skills"),
    location: z.string().optional(),
    jobType: z.enum(["full-time", "part-time", "contract", "internship", "remote"]).optional(),
    skills: z.array(z.string()).optional(),
    limit: z.number().optional(),
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await searchJobs(args), null, 2) }],
  })
);

server.tool(
  "match_jobs",
  "Match jobs to a candidate profile using skills, experience, location, and preferred job types",
  {
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({ title: z.string(), company: z.string() })).optional(),
    location: z.string().optional(),
    preferredJobTypes: z.array(z.string()).optional(),
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await matchJobs(args), null, 2) }],
  })
);

server.tool(
  "search_companies",
  "Search companies registered on the 9-to-5 job portal",
  {
    search: z.string().optional(),
    industry: z.string().optional(),
    limit: z.number().optional(),
  },
  async (args) => ({
    content: [{ type: "text", text: JSON.stringify(await searchCompanies(args), null, 2) }],
  })
);

server.tool(
  "get_portal_stats",
  "Get counts of active jobs, companies, and remote openings",
  {},
  async () => ({
    content: [{ type: "text", text: JSON.stringify(await getPortalStats(), null, 2) }],
  })
);

server.tool(
  "get_chat_context",
  "Fetch relevant jobs and companies from MongoDB for a user chat message",
  {
    message: z.string().describe("The user's chat message"),
  },
  async ({ message }) => ({
    content: [{ type: "text", text: JSON.stringify(await getChatContext(message), null, 2) }],
  })
);

const main = async () => {
  await connectDB();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("9-to-5 MCP stdio server running");
};

main().catch((err) => {
  console.error("MCP stdio server failed:", err.message);
  process.exit(1);
});
