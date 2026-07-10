# OpportuneBridge

**OpportuneBridge** is a career platform designed to bridge the gap between talent and employers. Built with the **MERN Stack** (MongoDB, Express, React, Node.js), it provides a platform for job seekers, recruiters, and administrators.

## Key Features

### User Roles
- **Students**: Browse and apply for jobs, build resumes, and access career guidance.
- **Recruiters**: Post jobs, manage applications, and view candidate profiles.
- **Admins**: Monitor platform analytics, manage companies, and oversee users.

### AI-Powered Tools
- **Career Assistant**: AI-powered chatbot for career guidance, resume tips, and interview preparation (powered by Groq API with Llama-3.1-8B-Instant model)
- **Candidate Ranking**: AI-assisted candidate scoring for recruiters based on skills, experience, and profile completeness. Falls back to algorithmic scoring if AI is unavailable.

### Job Portal Core
- **Job Search**: Filter jobs by location, role, and salary.
- **Application Tracking**: Track status of job applications.
- **Company Profiles**: View company information and posted positions.
- **Resume Management**: Upload and manage multiple resume versions using Cloudinary.

---

## Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS v4, Shadcn UI
- **Backend**: Node.js, Express.js (v5)
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Groq API (Llama-3.1-8B-Instant) for career assistance and candidate ranking
- **Authentication**: JWT, Google OAuth (React OAuth Google)
- **File Storage**: Cloudinary (for resumes and profile photos)
- **Email**: Nodemailer for email notifications
- **Logging**: Custom logger utility for structured logging
- **Environment Validation**: Centralized environment variable validation

---

## Installation & Setup

Follow these steps to get the project running locally.

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- Groq API Key

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/OpportuneBridge.git
cd OpportuneBridge
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GROQ_API_KEY=your_groq_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend development server:
```bash
npm run dev
```

### 5. Create Super Admin Account
To create the super admin account, run the seed script:
```bash
cd backend
node seedSuperAdmin.js
```
- Email: [configured in seed script]
- Password: [configured in seed script]

### 6. Access the App
Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## Architecture

### Backend Structure
- **Controllers**: Handle HTTP requests and business logic
- **Models**: Mongoose schemas for MongoDB (User, Job, Application, Company)
- **Services**: Business logic layer (candidate ranking, career assistant)
- **Middleware**: Authentication, error handling, admin verification
- **Utils**: Logger, environment validation, helper functions

### Frontend Structure
- **Components**: Reusable UI components using Shadcn UI
- **Context**: Authentication context for global state
- **Services**: API client for backend communication
- **Store**: Redux Toolkit for state management
- **Constants**: API endpoints and configuration

### Key Implementation Details
- **Candidate Ranking**: Algorithmic scoring based on skills match (60%), experience (20%), education (10%), and profile completeness (10%). AI enhancement via Groq API is optional and falls back gracefully.
- **Career Assistant**: Enforces career-related queries only. Non-career questions are declined by the AI.
- **Authentication**: JWT tokens for session management, Google OAuth for social login
- **File Uploads**: Cloudinary integration for resume and profile photo storage
- **Error Handling**: Centralized error middleware with structured logging

---

## Deployment

#### Backend Deployment

https://opportunebridge.onrender.com

#### Frontend Deployment

https://opportune-bridge.vercel.app

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
