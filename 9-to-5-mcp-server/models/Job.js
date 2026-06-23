const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    skills: [String],
    experienceMin: { type: Number, default: 0 },
    experienceMax: Number,
    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: "INR" },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    openings: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    applicationDeadline: Date,
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", skills: "text" });

module.exports = mongoose.models.Job || mongoose.model("Job", jobSchema);
