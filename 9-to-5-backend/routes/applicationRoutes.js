const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");
const { protect, authorizeCandidate, authorizeCompany } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/mine", protect, authorizeCandidate, getMyApplications);
router.get("/job/:jobId", protect, authorizeCompany, getJobApplications);

router.post(
  "/:jobId",
  protect,
  authorizeCandidate,
  uploadResume.single("resume"),
  applyToJob
);

router.delete("/:id/withdraw", protect, authorizeCandidate, withdrawApplication);
router.patch("/:id/status", protect, authorizeCompany, updateApplicationStatus);

module.exports = router;
