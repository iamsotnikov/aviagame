const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/aviagame");
    console.log(`✅ Успешное подключение к MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

