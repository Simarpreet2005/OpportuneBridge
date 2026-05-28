import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { logger } from "./logger.js";

export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminName = process.env.SUPER_ADMIN_NAME;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const seedEmail = superAdminEmail || adminEmail;
    const seedName = superAdminName || adminName;
    const seedPassword = superAdminPassword || adminPassword;
    const seedRole = superAdminEmail || superAdminPassword || superAdminName ? "superadmin" : "admin";

    // Check if environment variables are set
    if (!seedEmail || !seedName || !seedPassword) {
      logger.warn("Admin environment variables not set. Skipping admin seeding.");
      return;
    }

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email: seedEmail });
    
    if (existingAdmin) {
      const updates = {};
      if (existingAdmin.role !== seedRole) updates.role = seedRole;

      const hashedPassword = await bcrypt.hash(seedPassword, 10);
      updates.password = hashedPassword;
      updates.fullname = seedName;

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: existingAdmin._id }, { $set: updates });
        logger.info("Admin user updated successfully");
      } else {
        logger.info("Admin already exists");
      }
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(seedPassword, 10);

    // Create superadmin user
    await User.create({
      fullname: seedName,
      email: seedEmail,
      phoneNumber: 0, // Default phone number for superadmin
      password: hashedPassword,
      role: seedRole,
      profile: {
        bio: seedRole === "superadmin" ? "System Super Administrator" : "System Administrator",
        skills: [],
        profilePhoto: ""
      }
    });

    logger.info("Admin created successfully");
  } catch (error) {
    logger.error("Error seeding super admin", { message: error.message });
    throw error;
  }
};
