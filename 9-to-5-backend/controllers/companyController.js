const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");

const registerCompany = async (req, res) => {
  const { name, email, password, website, industry, companySize, location } = req.body;

  const exists = await Company.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const company = await Company.create({
    name,
    email,
    password,
    website,
    industry,
    companySize,
    location,
  });

  res.status(201).json({
    _id: company._id,
    name: company.name,
    email: company.email,
    token: generateToken({ id: company._id, role: "company" }),
  });
};

const loginCompany = async (req, res) => {
  const { email, password } = req.body;

  const company = await Company.findOne({ email });
  if (!company || !(await company.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    _id: company._id,
    name: company.name,
    email: company.email,
    token: generateToken({ id: company._id, role: "company" }),
  });
};

const getProfile = async (req, res) => {
  res.json(req.company);
};

const updateProfile = async (req, res) => {
  const company = await Company.findById(req.company._id);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  const fields = [
    "name",
    "website",
    "industry",
    "companySize",
    "description",
    "logoUrl",
    "location",
    "foundedYear",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      company[field] = req.body[field];
    }
  });

  const updated = await company.save();
  res.json(updated);
};

const getAllCompanies = async (req, res) => {
  const { industry, location, page = 1, limit = 10, search } = req.query;
  const filter = { isActive: true };

  if (industry) filter.industry = new RegExp(industry, "i");
  if (location) filter.location = new RegExp(location, "i");
  if (search) filter.name = new RegExp(search, "i");

  const skip = (Number(page) - 1) * Number(limit);
  const companies = await Company.find(filter)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Company.countDocuments(filter);

  res.json({
    companies,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
};

const getCompanyById = async (req, res) => {
  const company = await Company.findById(req.params.id).select("-password");
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  res.json(company);
};

module.exports = {
  registerCompany,
  loginCompany,
  getProfile,
  updateProfile,
  getAllCompanies,
  getCompanyById,
};
