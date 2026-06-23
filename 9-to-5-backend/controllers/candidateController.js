const Candidate = require("../models/Candidate");
const generateToken = require("../utils/generateToken");

const registerCandidate = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const exists = await Candidate.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const candidate = await Candidate.create({ name, email, password, phone });

  res.status(201).json({
    _id: candidate._id,
    name: candidate.name,
    email: candidate.email,
    token: generateToken({ id: candidate._id, role: "candidate" }),
  });
};

const loginCandidate = async (req, res) => {
  const { email, password } = req.body;

  const candidate = await Candidate.findOne({ email });
  if (!candidate || !(await candidate.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    _id: candidate._id,
    name: candidate.name,
    email: candidate.email,
    token: generateToken({ id: candidate._id, role: "candidate" }),
  });
};

const getProfile = async (req, res) => {
  res.json(req.candidate);
};

const updateProfile = async (req, res) => {
  const candidate = await Candidate.findById(req.candidate._id);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const fields = [
    "name",
    "phone",
    "headline",
    "summary",
    "skills",
    "experience",
    "education",
    "location",
    "expectedSalary",
    "preferredJobTypes",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      candidate[field] = req.body[field];
    }
  });

  if (req.file) {
    candidate.resumeUrl = `/uploads/resumes/${req.file.filename}`;
  }

  const updated = await candidate.save();
  res.json(updated);
};

const getAllCandidates = async (req, res) => {
  const { skills, location, page = 1, limit = 10 } = req.query;
  const filter = { isActive: true };

  if (skills) {
    filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
  }
  if (location) {
    filter.location = new RegExp(location, "i");
  }

  const skip = (Number(page) - 1) * Number(limit);
  const candidates = await Candidate.find(filter)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Candidate.countDocuments(filter);

  res.json({
    candidates,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
};

module.exports = {
  registerCandidate,
  loginCandidate,
  getProfile,
  updateProfile,
  getAllCandidates,
};
