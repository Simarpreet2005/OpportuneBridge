import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
const file=req.file;
const fileUri=getDataUri(file);
const cloudResponse=await cloudinary.uploader.upload(fileUri.content);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile:{
       profilePhoto:cloudResponse.secure_url
      }
    });

    // Remove password from response
    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', '),
        success: false,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
      });
    }
    
    return res.status(500).json({
      message: "Server error: " + error.message,
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    };
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or Password",
        success: false,
      });
    }
    // check role is correct or not
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role",
      });
    }
    const tokenData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: '1d'
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        success: true,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out Successfully",
      success:true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;

     // cloudinary comes here
    const fileUri=getDataUri(file);
    const cloudResponse=await cloudinay.uploader.upload(fileUri.content);
   
    let skillsArray;
    if(skills){skillsArray = skills.split(",");}
    const userId = req.id; // middleware authentication
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).
        json({
          message: "User not found",
          success: false,
        });
    }
  //updating data
   if(fullname) user.fullname = fullname;
    if(email)  user.email = email;
    if(phoneNumber)  user.phoneNumber = phoneNumber;
    if(bio)  user.profile.bio = bio;
    if(skills)user.profile.skills = skillsArray;

    // resume comes later here ...

    if(cloudResponse){
      user.profile.resume=cloudResponse.secure_url // save the cloudinary url
      user.profile.resumeOriginalName=file.originalname //save the original file name
    }
    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
        message:"Profile updated successfully ",user,
        success:true
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
