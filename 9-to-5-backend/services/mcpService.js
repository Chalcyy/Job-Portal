const Job = require("../models/Job");
const logger = require("../utils/logger");

/**
 * AI-powered job matching via MCP server.
 * Falls back to skill-based MongoDB query when MCP is unavailable.
 */
const getMatchedJobs = async (candidate) => {
  const mcpUrl = process.env.MCP_SERVER_URL;

  if (mcpUrl) {
    try {
      const response = await fetch(`${mcpUrl}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: candidate.skills || [],
          experience: candidate.experience || [],
          location: candidate.location,
          preferredJobTypes: candidate.preferredJobTypes || [],
        }),
      });

      if (response.ok) {
        const { jobIds } = await response.json();
        if (jobIds?.length) {
          return Job.find({ _id: { $in: jobIds }, isActive: true })
            .populate("company", "name location industry logoUrl")
            .limit(20);
        }
      }
    } catch (error) {
      logger.warn(`MCP matching unavailable, using fallback: ${error.message}`);
    }
  }

  const filter = { isActive: true };

  if (candidate.skills?.length) {
    filter.skills = { $in: candidate.skills };
  }
  if (candidate.location) {
    filter.location = new RegExp(candidate.location, "i");
  }
  if (candidate.preferredJobTypes?.length) {
    filter.jobType = { $in: candidate.preferredJobTypes };
  }

  return Job.find(filter)
    .populate("company", "name location industry logoUrl")
    .sort({ createdAt: -1 })
    .limit(20);
};

module.exports = { getMatchedJobs };
