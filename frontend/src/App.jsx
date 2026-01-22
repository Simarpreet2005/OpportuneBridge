import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Navbar from "./components/shared/Navbar"

import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import ForgotPassword from "./components/auth/ForgotPassword"
import ResetPassword from "./components/auth/ResetPassword"
import Home from "./components/Home"
import Jobs from "./components/Jobs"
import Browse from "./components/Browse"
import Profile from "./components/Profile"
import JobDescription from "./components/JobDescription"
import CommunityFeed from "./components/community/CommunityFeed"
import Challenges from "./pages/Challenges"
import ChallengeSpace from "./components/challenge/ChallengeSpace"

import ResumeList from "./components/resume/ResumeList"
import ResumeBuilder from "./components/resume/ResumeBuilder"
import InterviewHome from "./components/interview/InterviewHome"
import InterviewRoom from "./components/interview/InterviewRoom"

import MockInterviewHome from "./components/mockInterview/MockInterviewHome"
import MockInterviewSession from "./components/mockInterview/MockInterviewSession"
import MockInterviewResult from "./components/mockInterview/MockInterviewResult"

import Companies from "./components/admin/Companies"
import CompanyCreate from "./components/admin/CompanyCreate"
import CompanySetup from "./components/admin/CompanySetup"
import AdminDashboard from "./components/admin/AdminDashboard"
import AdminJobs from "./components/admin/AdminJobs"
import PostJob from "./components/admin/PostJob"
import Applicants from "./components/admin/Applicants"
import ProtectedRoute from "./components/admin/ProtectedRoute"
import SuperAdminDashboard from "./components/admin/SuperAdminDashboard"
import SuperAdminUsers from "./components/admin/SuperAdminUsers"
import SuperAdminAnalytics from "./components/admin/SuperAdminAnalytics"

import Chatbot from "./components/Chatbot"
import Dashboard from "./pages/Dashboard"

const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },

      { path: "/", element: <Home /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/jobs", element: <Jobs /> },
      { path: "/browse", element: <Browse /> },
      { path: "/profile", element: <Profile /> },
      { path: "/jobs/:id", element: <JobDescription /> },

      { path: "/community", element: <CommunityFeed /> },
      { path: "/challenges", element: <Challenges /> },
      { path: "/challenge/:id", element: <ChallengeSpace /> },

      { path: "/resumes", element: <ResumeList /> },
      { path: "/resume-builder", element: <ResumeBuilder /> },
      { path: "/resume-builder/:id", element: <ResumeBuilder /> },

      { path: "/interview", element: <InterviewHome /> },
      { path: "/interview/room/:id", element: <InterviewRoom /> },

      { path: "/mock-interview", element: <MockInterviewHome /> },
      { path: "/mock-interview/session/:id", element: <MockInterviewSession /> },
      { path: "/mock-interview/result/:id", element: <MockInterviewResult /> },

      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "/superadmin/dashboard",
        element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>
      },
      {
        path: "/superadmin/users",
        element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminUsers /></ProtectedRoute>
      },
      {
        path: "/superadmin/analytics",
        element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAnalytics /></ProtectedRoute>
      },
      {
        path: "/admin/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/companies/create",
        element: (
          <ProtectedRoute>
            <CompanyCreate />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/companies/:id",
        element: (
          <ProtectedRoute>
            <CompanySetup />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs",
        element: (
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs/create",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs/:id/applicants",
        element: (
          <ProtectedRoute>
            <Applicants />
          </ProtectedRoute>
        )
      },

    ]
  }
])

import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={appRouter} />
        <Chatbot />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
