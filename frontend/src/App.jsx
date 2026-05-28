import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Navbar from "./layout/Navbar"
import ErrorBoundary from "./ui/ErrorBoundary"
import RouteFallback from "./ui/RouteFallback"

const Login = lazy(() => import("./pages/auth/Login"))
const Signup = lazy(() => import("./pages/auth/Signup"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"))
const Home = lazy(() => import("./pages/Home"))
const Jobs = lazy(() => import("./jobs/Jobs"))
const Browse = lazy(() => import("./jobs/Browse"))
const Profile = lazy(() => import("./pages/Profile"))
const JobDescription = lazy(() => import("./jobs/JobDescription"))

const Companies = lazy(() => import("./pages/admin/Companies"))
const CompanyCreate = lazy(() => import("./pages/admin/CompanyCreate"))
const CompanySetup = lazy(() => import("./pages/admin/CompanySetup"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs"))
const PostJob = lazy(() => import("./pages/admin/PostJob"))
const Applicants = lazy(() => import("./pages/admin/Applicants"))
const ProtectedRoute = lazy(() => import("./pages/admin/ProtectedRoute"))
const SuperAdminDashboard = lazy(() => import("./pages/admin/SuperAdminDashboard"))
const SuperAdminUsers = lazy(() => import("./pages/admin/SuperAdminUsers"))
const SuperAdminAnalytics = lazy(() => import("./pages/admin/SuperAdminAnalytics"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"))
const CareerAssistant = lazy(() => import("./components/CareerAssistant"))
const SavedJobs = lazy(() => import("./pages/student/SavedJobs"))

const Layout = () => {
  return (
    <>
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
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
      { path: "/jobs", element: <Jobs /> },
      { path: "/browse", element: <Browse /> },
      { path: "/jobs/:id", element: <JobDescription /> },

      { path: "/dashboard", element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
      { path: "/profile", element: <ProtectedRoute allowedRoles={['student', 'recruiter', 'admin', 'superadmin']}><Profile /></ProtectedRoute> },
      { path: "/career-assistant", element: <ProtectedRoute allowedRoles={['student']}><CareerAssistant /></ProtectedRoute> },
      { path: "/saved-jobs", element: <ProtectedRoute allowedRoles={['student']}><SavedJobs /></ProtectedRoute> },

      {
        path: "/admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
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
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
            <Companies />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/companies/create",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
            <CompanyCreate />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/companies/:id",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
            <CompanySetup />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
            <AdminJobs />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs/create",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
            <PostJob />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin/jobs/:id/applicants",
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}>
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
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
