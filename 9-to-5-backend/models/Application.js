const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    coverLetter: String,
    resumeUrl: String,
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "interview", "offered", "rejected", "withdrawn"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
