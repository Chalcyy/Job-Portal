const Job = require("../models/Job");
const Company = require("../models/Company");
const { getMatchedJobs } = require("../services/mcpService");

const createJob = async (req, res) => {
  const job = await Job.create({
    ...req.body,
    company: req.company._id,
  });

  const populated = await job.populate("company", "name location industry logoUrl");
  res.status(201).json(populated);
};

const getJobs = async (req, res) => {
  const {
    search,
    location,
    jobType,
    experienceMin,
    skills,
    page = 1,
    limit = 10,
    sort = "newest",
  } = req.query;

  const filter = { isActive: true };

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    // Find matching companies to match jobs of those companies
    const matchingCompanies = await Company.find({ name: searchRegex }).select("_id");
    const companyIds = matchingCompanies.map((c) => c._id);

    filter.$or = [
      { title: searchRegex },
      { skills: searchRegex },
      { description: searchRegex },
      { company: { $in: companyIds } }
    ];
  }
  if (location) {
    filter.location = new RegExp(location, "i");
  }
  if (jobType) {
    filter.jobType = jobType;
  }
  if (experienceMin) {
    filter.experienceMin = { $lte: Number(experienceMin) };
  }
  if (skills) {
    filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    salary: { salaryMax: -1 },
    relevance: { createdAt: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const query = Job.find(filter).populate("company", "name location industry logoUrl");

  const jobs = await query
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions[sort] || sortOptions.newest);

  const total = await Job.countDocuments(filter);

  res.json({
    jobs,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
};

const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "company",
    "name location industry logoUrl website description"
  );

  if (!job || !job.isActive) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json(job);
};

const getCompanyJobs = async (req, res) => {
  const jobs = await Job.find({ company: req.company._id }).sort({ createdAt: -1 });
  res.json(jobs);
};

const updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.company.toString() !== req.company._id.toString()) {
    return res.status(403).json({ message: "Not authorized to update this job" });
  }

  Object.assign(job, req.body);
  const updated = await job.save();
  res.json(updated);
};

const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.company.toString() !== req.company._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this job" });
  }

  job.isActive = false;
  await job.save();
  res.json({ message: "Job deactivated successfully" });
};

const getRecommendedJobs = async (req, res) => {
  const candidate = req.candidate;
  const jobs = await getMatchedJobs(candidate);
  res.json(jobs);
};

const getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const searchStr = q.trim();
    const regex = new RegExp(searchStr, "i");

    // Fetch distinct matches for title, company name, and skills
    const jobs = await Job.find({ title: regex, isActive: true }).limit(10).select("title");
    const companies = await Company.find({ name: regex, isActive: true }).limit(10).select("name");
    
    // Skills is an array, we find jobs with matching skills and extract them
    const jobsWithSkills = await Job.find({ skills: regex, isActive: true }).limit(10).select("skills");

    const suggestions = [];

    // Add matching job titles
    jobs.forEach((j) => {
      if (j.title && !suggestions.some((s) => s.text.toLowerCase() === j.title.toLowerCase())) {
        suggestions.push({ type: "title", text: j.title });
      }
    });

    // Add matching companies
    companies.forEach((c) => {
      if (c.name && !suggestions.some((s) => s.text.toLowerCase() === c.name.toLowerCase())) {
        suggestions.push({ type: "company", text: c.name });
      }
    });

    // Add matching skills
    jobsWithSkills.forEach((j) => {
      if (j.skills) {
        j.skills.forEach((s) => {
          if (
            s.toLowerCase().includes(searchStr.toLowerCase()) &&
            !suggestions.some((sug) => sug.text.toLowerCase() === s.toLowerCase())
          ) {
            suggestions.push({ type: "skill", text: s });
          }
        });
      }
    });

    res.json(suggestions.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getCompanyJobs,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  getSuggestions,
};
