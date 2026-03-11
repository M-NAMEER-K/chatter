import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully ");
  } catch (error) {
    console.error("Database connection failed ");
    console.error(error);
    process.exit(1); // stop app if DB fails
  }
};

export default connectDB;
