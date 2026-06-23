const Job = require("../models/Job");
const Company = require("../models/Company");

const formatJob = (job) => ({
  id: job._id.toString(),
  title: job.title,
  company: job.company?.name || "Unknown",
  location: job.location,
  jobType: job.jobType,
  skills: job.skills || [],
  experienceMin: job.experienceMin,
  experienceMax: job.experienceMax,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  salaryCurrency: job.salaryCurrency,
  description: job.description?.slice(0, 400),
});

const searchJobs = async ({ search, location, jobType, skills, limit = 10 } = {}) => {
  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }
  if (location) {
    filter.location = new RegExp(location, "i");
  }
  if (jobType) {
    filter.jobType = jobType;
  }
  if (skills?.length) {
    filter.skills = { $in: skills };
  }

  let query = Job.find(filter)
    .populate("company", "name location industry")
    .limit(Math.min(limit, 20));

  if (search) {
    query = query.sort({ score: { $meta: "textScore" } });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const jobs = await query;
  return jobs.map(formatJob);
};

const matchJobs = async ({ skills = [], experience = [], location, preferredJobTypes = [] } = {}) => {
  const filter = { isActive: true };

  if (skills.length) {
    filter.skills = { $in: skills };
  }
  if (location) {
    filter.location = new RegExp(location, "i");
  }
  if (preferredJobTypes.length) {
    filter.jobType = { $in: preferredJobTypes };
  }

  const jobs = await Job.find(filter)
    .populate("company", "name location industry logoUrl")
    .sort({ createdAt: -1 })
    .limit(20);

  return {
    jobIds: jobs.map((j) => j._id.toString()),
    jobs: jobs.map(formatJob),
    experienceYears: experience.length,
  };
};

const searchCompanies = async ({ search, industry, limit = 8 } = {}) => {
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { industry: new RegExp(search, "i") },
      { location: new RegExp(search, "i") },
    ];
  }
  if (industry) {
    filter.industry = new RegExp(industry, "i");
  }

  const companies = await Company.find(filter)
    .select("name industry location description companySize isVerified")
    .limit(Math.min(limit, 15))
    .sort({ name: 1 });

  return companies.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    industry: c.industry,
    location: c.location,
    companySize: c.companySize,
    isVerified: c.isVerified,
    description: c.description?.slice(0, 250),
  }));
};

const getPortalStats = async () => {
  const [jobCount, companyCount, remoteCount] = await Promise.all([
    Job.countDocuments({ isActive: true }),
    Company.countDocuments({ isActive: true }),
    Job.countDocuments({ isActive: true, jobType: "remote" }),
  ]);

  return { jobCount, companyCount, remoteCount };
};

const getChatContext = async (message) => {
  const keywords = message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 8)
    .join(" ");

  const [jobs, companies, stats] = await Promise.all([
    searchJobs({ search: keywords || undefined, limit: 6 }),
    searchCompanies({ search: keywords || undefined, limit: 4 }),
    getPortalStats(),
  ]);

  return { jobs, companies, stats, keywords: keywords || "(general)" };
};

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was",
  "one", "our", "out", "day", "get", "has", "him", "his", "how", "its", "may",
  "new", "now", "old", "see", "two", "way", "who", "boy", "did", "let", "put",
  "say", "she", "too", "use", "what", "when", "where", "which", "with", "have",
  "this", "that", "from", "they", "will", "would", "there", "their", "about",
  "into", "your", "some", "them", "than", "then", "these", "those", "being",
  "jobs", "job", "work", "find", "help", "please", "want", "need", "like",
]);

const TOOL_HANDLERS = {
  search_jobs: searchJobs,
  match_jobs: matchJobs,
  search_companies: searchCompanies,
  get_portal_stats: getPortalStats,
  get_chat_context: getChatContext,
};

const invokeTool = async (name, args = {}) => {
  const handler = TOOL_HANDLERS[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return handler(args);
};

module.exports = {
  searchJobs,
  matchJobs,
  searchCompanies,
  getPortalStats,
  getChatContext,
  invokeTool,
  TOOL_HANDLERS,
};
