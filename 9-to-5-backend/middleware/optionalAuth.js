  const jwt = require("jsonwebtoken");
const Candidate = require("../models/Candidate");
const Company = require("../models/Company");

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role === "candidate") {
      req.candidate = await Candidate.findById(decoded.id).select("-password");
    } else if (decoded.role === "company") {
      req.company = await Company.findById(decoded.id).select("-password");
    }
  } catch {
    // Guest chat is allowed without valid token
  }

  next();
};

module.exports = { optionalAuth };
