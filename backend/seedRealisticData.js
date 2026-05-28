import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { logger } from "./utils/logger.js";

dotenv.config({ override: true });

const SEED_EMAIL_DOMAIN = "seed.opportunebridge.local";
const SEED_EMAIL_PATTERN = `@${SEED_EMAIL_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;

const recruiters = [
    ["Aarav Mehta", "aarav.mehta", "Principal technical recruiter focused on product engineering teams."],
    ["Maya Rao", "maya.rao", "Recruiting partner for cloud, data, and infrastructure roles."],
    ["Nikhil Sharma", "nikhil.sharma", "Talent lead for high-growth SaaS and platform teams."],
    ["Isha Kapoor", "isha.kapoor", "Hiring specialist for design, mobile, and customer experience roles."],
    ["Kabir Sen", "kabir.sen", "Recruiter supporting security and compliance engineering searches."],
    ["Riya Nair", "riya.nair", "Campus and early-career recruiter for engineering internships."],
    ["Dev Malhotra", "dev.malhotra", "Executive recruiter for senior backend and architecture roles."],
    ["Ananya Das", "ananya.das", "Recruiting operations lead for distributed product teams."],
    ["Samar Gill", "samar.gill", "Talent partner for AI, ML, and analytics organizations."],
    ["Meera Joshi", "meera.joshi", "Recruiter focused on fintech, risk, and payments hiring."]
];

const students = [
    ["Priya Bansal", "priya.bansal", ["React", "JavaScript", "Node.js", "MongoDB"]],
    ["Arjun Verma", "arjun.verma", ["Python", "Machine Learning", "SQL", "Docker"]],
    ["Neha Kulkarni", "neha.kulkarni", ["Java", "Spring Boot", "Microservices", "AWS"]],
    ["Rahul Iyer", "rahul.iyer", ["React Native", "TypeScript", "Firebase", "REST APIs"]],
    ["Sneha Thomas", "sneha.thomas", ["Figma", "User Research", "Design Systems", "Prototyping"]],
    ["Karan Ahuja", "karan.ahuja", ["Linux", "Kubernetes", "CI/CD", "Terraform"]],
    ["Zoya Khan", "zoya.khan", ["Cybersecurity", "SIEM", "Python", "Networking"]],
    ["Aditya Menon", "aditya.menon", ["Data Engineering", "Spark", "Airflow", "PostgreSQL"]]
];

const companies = [
    {
        name: "Northstar Cloud Systems",
        location: "Bengaluru, India",
        website: "https://northstarcloud.example",
        logo: "https://ui-avatars.com/api/?name=Northstar+Cloud&background=1f6feb&color=fff",
        description: "Builds managed Kubernetes, observability, and deployment tooling for mid-market SaaS teams."
    },
    {
        name: "LedgerPeak Finance",
        location: "Mumbai, India",
        website: "https://ledgerpeak.example",
        logo: "https://ui-avatars.com/api/?name=LedgerPeak&background=0f766e&color=fff",
        description: "Develops payments infrastructure, treasury automation, and fraud review workflows for digital finance companies."
    },
    {
        name: "Evergreen HealthTech",
        location: "Hyderabad, India",
        website: "https://evergreenhealth.example",
        logo: "https://ui-avatars.com/api/?name=Evergreen+Health&background=15803d&color=fff",
        description: "Creates clinical operations software for appointment routing, patient analytics, and care team collaboration."
    },
    {
        name: "Arcbyte Analytics",
        location: "Pune, India",
        website: "https://arcbyte.example",
        logo: "https://ui-avatars.com/api/?name=Arcbyte&background=7c3aed&color=fff",
        description: "Provides data products that help operations teams forecast demand, detect anomalies, and automate reporting."
    },
    {
        name: "Harbor Retail Labs",
        location: "Gurugram, India",
        website: "https://harborretail.example",
        logo: "https://ui-avatars.com/api/?name=Harbor+Retail&background=be123c&color=fff",
        description: "Builds commerce tooling for inventory planning, personalized offers, and marketplace seller workflows."
    },
    {
        name: "Switchboard Mobility",
        location: "Chennai, India",
        website: "https://switchboardmobility.example",
        logo: "https://ui-avatars.com/api/?name=Switchboard&background=0369a1&color=fff",
        description: "Designs mobile-first fleet operations platforms for logistics, route optimization, and driver safety."
    },
    {
        name: "BrightHire Studio",
        location: "Remote - India",
        website: "https://brighthirestudio.example",
        logo: "https://ui-avatars.com/api/?name=BrightHire&background=ca8a04&color=fff",
        description: "Partners with hiring teams to improve candidate experience, assessment design, and recruiter productivity."
    },
    {
        name: "CipherNest Security",
        location: "Noida, India",
        website: "https://ciphernest.example",
        logo: "https://ui-avatars.com/api/?name=CipherNest&background=111827&color=fff",
        description: "Delivers security monitoring, access governance, and incident response tooling for regulated businesses."
    },
    {
        name: "GreenGrid Energy",
        location: "Ahmedabad, India",
        website: "https://greengrid.example",
        logo: "https://ui-avatars.com/api/?name=GreenGrid&background=166534&color=fff",
        description: "Creates forecasting and control software for distributed solar, battery, and smart-meter networks."
    },
    {
        name: "PixelForge Product Co.",
        location: "Delhi, India",
        website: "https://pixelforge.example",
        logo: "https://ui-avatars.com/api/?name=PixelForge&background=db2777&color=fff",
        description: "Builds polished web and mobile products for founders, enterprise innovation teams, and creator platforms."
    },
    {
        name: "RelayWorks Logistics",
        location: "Kochi, India",
        website: "https://relayworks.example",
        logo: "https://ui-avatars.com/api/?name=RelayWorks&background=ea580c&color=fff",
        description: "Modernizes shipment tracking, warehouse coordination, and customer delivery visibility for logistics networks."
    },
    {
        name: "Mosaic Learning Labs",
        location: "Jaipur, India",
        website: "https://mosaiclearning.example",
        logo: "https://ui-avatars.com/api/?name=Mosaic+Learning&background=4f46e5&color=fff",
        description: "Creates adaptive learning tools, assessment analytics, and mentor dashboards for technical education providers."
    }
];

const jobFamilies = [
    {
        title: "Frontend Engineer",
        skills: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
        descriptions: [
            "Own reusable product screens, improve client-side performance, and partner with design to ship accessible workflows.",
            "Build data-heavy dashboards, reduce bundle weight, and maintain a reliable component layer for customer-facing teams."
        ]
    },
    {
        title: "Backend Node.js Engineer",
        skills: ["Node.js", "Express", "MongoDB", "Redis"],
        descriptions: [
            "Design APIs, improve service reliability, and build integrations that support high-volume operational workflows.",
            "Maintain core backend services, write resilient data access code, and improve observability around production incidents."
        ]
    },
    {
        title: "Full Stack Developer",
        skills: ["React", "Node.js", "MongoDB", "AWS"],
        descriptions: [
            "Deliver end-to-end features from database schema to polished UI while improving test coverage and deployment safety.",
            "Work across product surfaces, refactor legacy flows, and collaborate closely with product managers on rapid experiments."
        ]
    },
    {
        title: "Data Engineer",
        skills: ["Python", "SQL", "Airflow", "Spark"],
        descriptions: [
            "Build reliable data pipelines, improve warehouse models, and support analytics consumers with clean documented datasets.",
            "Create ingestion jobs, monitor pipeline health, and partner with analysts to improve reporting freshness and accuracy."
        ]
    },
    {
        title: "Machine Learning Engineer",
        skills: ["Python", "Machine Learning", "MLOps", "Docker"],
        descriptions: [
            "Train and deploy models for ranking, forecasting, or anomaly detection with pragmatic monitoring and rollback plans.",
            "Convert prototypes into production ML services, evaluate model quality, and improve feature pipelines."
        ]
    },
    {
        title: "DevOps Engineer",
        skills: ["Kubernetes", "Terraform", "CI/CD", "AWS"],
        descriptions: [
            "Improve deployment automation, harden cloud infrastructure, and reduce incident recovery time for engineering teams.",
            "Maintain container platforms, automate environment provisioning, and strengthen release pipelines."
        ]
    },
    {
        title: "Product Designer",
        skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
        descriptions: [
            "Design practical workflows for complex business users, validate ideas with research, and maintain design system quality.",
            "Translate ambiguous product problems into clear flows, prototypes, and implementation-ready design specs."
        ]
    },
    {
        title: "Mobile Engineer",
        skills: ["React Native", "TypeScript", "Mobile Performance", "Firebase"],
        descriptions: [
            "Build reliable mobile experiences, improve app startup time, and support release quality across Android and iOS.",
            "Own mobile feature delivery, integrate backend APIs, and collaborate with QA on device-specific issues."
        ]
    },
    {
        title: "Security Analyst",
        skills: ["SIEM", "Incident Response", "Networking", "Python"],
        descriptions: [
            "Triage security alerts, tune detection rules, and support incident response activities for production systems.",
            "Review logs, investigate suspicious activity, and improve security playbooks for regulated customers."
        ]
    },
    {
        title: "QA Automation Engineer",
        skills: ["Playwright", "API Testing", "JavaScript", "CI/CD"],
        descriptions: [
            "Create automated regression suites, improve release confidence, and partner with engineers on testable acceptance criteria.",
            "Build stable browser and API tests, reduce flaky coverage, and report actionable quality signals."
        ]
    }
];

const locations = [
    "Bengaluru, India",
    "Mumbai, India",
    "Hyderabad, India",
    "Pune, India",
    "Gurugram, India",
    "Chennai, India",
    "Noida, India",
    "Remote - India",
    "Delhi, India",
    "Kochi, India"
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const experienceLevels = ["0-1 years", "1-3 years", "3-5 years", "5-8 years", "8+ years"];

const seededEmail = (slug) => `${slug}@${SEED_EMAIL_DOMAIN}`;

const buildUsers = async () => {
    const password = await bcrypt.hash("Password@123", 10);
    const recruiterDocs = [];

    for (const [index, [fullname, slug, bio]] of recruiters.entries()) {
        const user = await User.findOneAndUpdate(
            { email: seededEmail(slug) },
            {
                fullname,
                email: seededEmail(slug),
                phoneNumber: 8800001000 + index,
                password,
                role: "recruiter",
                profile: {
                    bio,
                    skills: ["Talent Acquisition", "Technical Hiring", "Stakeholder Management"],
                    profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=2563eb&color=fff`
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        recruiterDocs.push(user);
    }

    for (const [index, [fullname, slug, skills]] of students.entries()) {
        await User.findOneAndUpdate(
            { email: seededEmail(slug) },
            {
                fullname,
                email: seededEmail(slug),
                phoneNumber: 8800002000 + index,
                password,
                role: "student",
                profile: {
                    bio: `${fullname.split(" ")[0]} is preparing for product engineering roles and building portfolio projects with ${skills.slice(0, 2).join(" and ")}.`,
                    skills,
                    isVerifiedSkill: index % 2 === 0,
                    profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=0f766e&color=fff`,
                    gamification: {
                        xp: 450 + index * 175,
                        rank: ["Bronze", "Silver", "Gold", "Platinum"][index % 4],
                        badges: index % 2 === 0 ? ["Portfolio Builder"] : ["Interview Ready"]
                    }
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    return recruiterDocs;
};

const buildCompanies = async (recruiterDocs) => {
    const companyDocs = [];

    for (const [index, company] of companies.entries()) {
        const doc = await Company.findOneAndUpdate(
            { name: company.name },
            {
                ...company,
                userId: recruiterDocs[index % recruiterDocs.length]._id
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        companyDocs.push(doc);
    }

    return companyDocs;
};

const salaryFor = (index, jobType) => {
    if (jobType === "Internship") return 25000 + (index % 6) * 5000;
    if (jobType === "Part-time") return 45000 + (index % 7) * 6000;
    if (jobType === "Contract" || jobType === "Freelance") return 90000 + (index % 8) * 12000;
    return 850000 + (index % 12) * 175000;
};

const buildJobs = async (companyDocs) => {
    const jobs = [];

    for (let index = 0; index < 60; index += 1) {
        const family = jobFamilies[index % jobFamilies.length];
        const company = companyDocs[index % companyDocs.length];
        const jobType = jobTypes[index % jobTypes.length];
        const titlePrefix = index % 4 === 0 ? "Senior " : index % 5 === 0 ? "Associate " : "";
        const title = `${titlePrefix}${family.title}`;
        const location = locations[(index + company.name.length) % locations.length];
        const requirements = [
            ...family.skills,
            index % 3 === 0 ? "System Design" : "Agile Delivery",
            index % 2 === 0 ? "Communication" : "Problem Solving"
        ];

        // Random timestamp between 1 day and 1 week ago
        const daysAgo = 1 + Math.random() * 6;
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        jobs.push({
            title,
            description: `${family.descriptions[index % family.descriptions.length]} This role at ${company.name} works closely with cross-functional peers and has clear ownership of production outcomes.`,
            requirements,
            salary: salaryFor(index, jobType),
            experienceLevel: experienceLevels[index % experienceLevels.length],
            location,
            jobType,
            opportunityType: jobType === "Internship" ? "Internship" : "Job",
            position: 1 + (index % 5),
            company: company._id,
            created_by: company.userId,
            createdAt
        });
    }

    await Job.insertMany(jobs);
    return jobs.length;
};

const clearOwnedSeedData = async () => {
    const seedUsers = await User.find({
        email: { $regex: SEED_EMAIL_PATTERN }
    }).select("_id");
    const seedUserIds = seedUsers.map((user) => user._id);

    const seedCompanyNames = companies.map((company) => company.name);
    const seedCompanies = await Company.find({
        $or: [
            { name: { $in: seedCompanyNames } },
            ...(seedUserIds.length ? [{ userId: { $in: seedUserIds } }] : [])
        ]
    }).select("_id");
    const seedCompanyIds = seedCompanies.map((company) => company._id);

    const jobDeleteFilter = {
        $or: [
            ...(seedUserIds.length ? [{ created_by: { $in: seedUserIds } }] : []),
            ...(seedCompanyIds.length ? [{ company: { $in: seedCompanyIds } }] : [])
        ]
    };

    const deletedJobs = jobDeleteFilter.$or.length ? await Job.deleteMany(jobDeleteFilter) : { deletedCount: 0 };
    const deletedCompanies = await Company.deleteMany({ name: { $in: seedCompanyNames } });
    const deletedUsers = await User.deleteMany({
        email: { $regex: SEED_EMAIL_PATTERN },
        role: { $in: ["student", "recruiter"] }
    });

    logger.info("Cleared owned seed data", {
        jobs: deletedJobs.deletedCount,
        companies: deletedCompanies.deletedCount,
        users: deletedUsers.deletedCount
    });
};

const seedDatabase = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to database for realistic seeding");

    await clearOwnedSeedData();

    const recruiterDocs = await buildUsers();
    const companyDocs = await buildCompanies(recruiterDocs);
    const jobCount = await buildJobs(companyDocs);

    logger.info("Realistic seed completed", {
        jobs: jobCount,
        companies: companyDocs.length,
        users: recruiters.length + students.length
    });
};

seedDatabase()
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((error) => {
        logger.error("Realistic seed failed", { message: error.message });
        process.exit(1);
    });
