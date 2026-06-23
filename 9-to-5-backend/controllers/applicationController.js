const Application = require("../models/Application");
const Job = require("../models/Job");

const applyToJob = async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job || !job.isActive) {
    return res.status(404).json({ message: "Job not found or no longer active" });
  }

  const existing = await Application.findOne({
    job: req.params.jobId,
    candidate: req.candidate._id,
  });

  if (existing) {
    return res.status(400).json({ message: "You have already applied to this job" });
  }

  const application = await Application.create({
    job: req.params.jobId,
    candidate: req.candidate._id,
    coverLetter: req.body.coverLetter,
    resumeUrl: req.file
      ? `/uploads/resumes/${req.file.filename}`
      : req.candidate.resumeUrl,
  });

  const populated = await application.populate([
    { path: "job", select: "title location company", populate: { path: "company", select: "name" } },
    { path: "candidate", select: "name email phone skills" },
  ]);

  res.status(201).json(populated);
};

const getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.candidate._id })
    .populate({
      path: "job",
      select: "title location jobType company",
      populate: { path: "company", select: "name logoUrl" },
    })
    .sort({ createdAt: -1 });

  res.json(applications);
};

const getJobApplications = async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.company.toString() !== req.company._id.toString()) {
    return res.status(403).json({ message: "Not authorized to view these applications" });
  }

  const applications = await Application.find({ job: req.params.jobId })
    .populate("candidate", "name email phone skills resumeUrl headline experience")
    .sort({ createdAt: -1 });

  res.json(applications);
};

const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id).populate("job");

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (application.job.company.toString() !== req.company._id.toString()) {
    return res.status(403).json({ message: "Not authorized to update this application" });
  }

  application.status = status;
  const updated = await application.save();
  res.json(updated);
};

const withdrawApplication = async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (application.candidate.toString() !== req.candidate._id.toString()) {
    return res.status(403).json({ message: "Not authorized to withdraw this application" });
  }

  application.status = "withdrawn";
  await application.save();
  res.json({ message: "Application withdrawn successfully" });
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};
