require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB:", mongoose.connection.host);
    console.log("Database:", mongoose.connection.name);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(
      "Collections:",
      collections.length ? collections.map((c) => c.name).join(", ") : "(none yet — created on first use)"
    );

    await mongoose.disconnect();
    console.log("MongoDB setup verified successfully.");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB setup failed:", error.message);
    process.exit(1);
  }
};

setup();
