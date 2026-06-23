const express = require("express");
const {
  registerCompany,
  loginCompany,
  getProfile,
  updateProfile,
  getAllCompanies,
  getCompanyById,
} = require("../controllers/companyController");
const { protect, authorizeCompany } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.get("/profile/me", protect, authorizeCompany, getProfile);
router.put("/profile/me", protect, authorizeCompany, updateProfile);
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);

module.exports = router;
