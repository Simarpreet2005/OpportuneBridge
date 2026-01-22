import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opportune_bridge';

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        if (existingSuperAdmin) process.exit(0);

        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        await User.create({
            fullname: 'Super Admin',
            email: 'admin@opportunebridge.com',
            phoneNumber: 9999999999,
            password: hashedPassword,
            role: 'superadmin',
            profile: {
                bio: 'System Administrator',
                skills: ['Administration', 'Management'],
                profilePhoto: ''
            }
        });
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

createSuperAdmin();
