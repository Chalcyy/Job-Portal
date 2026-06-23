const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: String,
    headline: String,
    summary: String,
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    resumeUrl: String,
    location: String,
    expectedSalary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" },
    },
    preferredJobTypes: [{ type: String, enum: ["full-time", "part-time", "contract", "internship", "remote"] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

candidateSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Candidate", candidateSchema);
