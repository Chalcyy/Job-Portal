const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MCP server connected to MongoDB: ${conn.connection.host}`);
};

module.exports = connectDB;
