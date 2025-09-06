const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.databaseURL);
    console.log("Database connected Successfully");
  } catch (error) {
    console.log("Couldn't connect to DB");
    process.exit(1);
  }
};

module.exports = connectDB;