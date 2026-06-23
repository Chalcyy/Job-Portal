const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  getCompanyJobs,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  getSuggestions,
} = require("../controllers/jobController");
const { protect, authorizeCandidate, authorizeCompany } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.get("/suggestions", getSuggestions);
router.get("/recommended", protect, authorizeCandidate, getRecommendedJobs);
router.get("/company/mine", protect, authorizeCompany, getCompanyJobs);
router.get("/:id", getJobById);

router.post("/", protect, authorizeCompany, createJob);
router.put("/:id", protect, authorizeCompany, updateJob);
router.delete("/:id", protect, authorizeCompany, deleteJob);

module.exports = router;
