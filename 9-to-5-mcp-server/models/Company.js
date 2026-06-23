const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    website: String,
    industry: String,
    companySize: String,
    description: String,
    logoUrl: String,
    location: String,
    foundedYear: Number,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Company || mongoose.model("Company", companySchema);
