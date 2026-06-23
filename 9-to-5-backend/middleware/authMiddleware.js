const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const Company = require("../models/Company");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role === "candidate") {
      req.candidate = await Candidate.findById(decoded.id).select("-password");
      if (!req.candidate) {
        return res.status(401).json({ message: "Candidate not found" });
      }
    } else if (decoded.role === "company") {
      req.company = await Company.findById(decoded.id).select("-password");
      if (!req.company) {
        return res.status(401).json({ message: "Company not found" });
      }
    }

    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

const authorizeCandidate = (req, res, next) => {
  if (req.user?.role !== "candidate") {
    return res.status(403).json({ message: "Access denied. Candidates only." });
  }
  next();
};

const authorizeCompany = (req, res, next) => {
  if (req.user?.role !== "company") {
    return res.status(403).json({ message: "Access denied. Companies only." });
  }
  next();
};

module.exports = { protect, authorizeCandidate, authorizeCompany };
