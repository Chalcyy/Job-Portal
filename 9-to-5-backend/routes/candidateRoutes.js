const express = require("express");
const {
  registerCandidate,
  loginCandidate,
  getProfile,
  updateProfile,
  getAllCandidates,
} = require("../controllers/candidateController");
const { protect, authorizeCandidate } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.get("/", getAllCandidates);

router.get("/profile", protect, authorizeCandidate, getProfile);
router.put(
  "/profile",
  protect,
  authorizeCandidate,
  uploadResume.single("resume"),
  updateProfile
);

module.exports = router;
