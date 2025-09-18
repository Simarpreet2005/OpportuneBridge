import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env explicitly from backend folder
dotenv.config({ path:"./backend/.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mogodb connected successfully');
  }catch(error){
    console.log(error);
  }
}

export default connectDB;
