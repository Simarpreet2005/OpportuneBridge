# 🌉 OpportuneBridge

**OpportuneBridge** is a modern, AI-powered career platform designed to bridge the gap between ambitious talent and top-tier employers. Built with the **MERN Stack** (MongoDB, Express, React, Node.js), it offers a seamless experience for job seekers, recruiters, and administrators.

## 🚀 Key Features

### 👤 User Roles
- **Students**: Browse and apply for jobs, build resumes, and practice with AI.
- **Recruiters**: Post jobs, manage applications, and view candidate profiles.
- **Admins**: Monitor platform analytics, manage companies, and oversee users.

### 🤖 AI-Powered Tools (Powered by Gemini)
- **Mock Interviews**: Real-time AI interview sessions with instant feedback on answers and code.
- **Resume Builder**: Smart suggestions to craft the perfect resume.
- **AI Chatbot**: Intelligent assistant to guide users through the platform.

### 💼 Job Portal Core
- **Advanced Search**: Filter jobs by location, role, and salary.
- **Application Tracking**: Real-time status updates on applied jobs.
- **Company Pages**: Detailed company profiles and open positions.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini API
- **Authentication**: JWT, Google OAuth (React OAuth Google)
- **File Storage**: Cloudinary (for resumes & profile pics)

---

## ⚙️ Installation & Setup

Follow these steps to get the project running locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Cloudinary Account](https://cloudinary.com/)
- [Google Gemini API Key](https://ai.google.dev/)

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
SECRET_KEY=your_jwt_secret
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
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

> [!IMPORTANT]
> For security reasons, change the default super admin password after first login. The default credentials are set in `backend/seedSuperAdmin.js` and should **never** be committed to a public repository.

### 6. Access the App
Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
