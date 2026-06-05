import { lazy } from "react";

const Login = lazy(() => import("../pages/auth/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const Home = lazy(() => import("../pages/Home"));
const Jobs = lazy(() => import("../jobs/Jobs"));
const Browse = lazy(() => import("../jobs/Browse"));
const JobDescription = lazy(() => import("../jobs/JobDescription"));
const Profile = lazy(() => import("../pages/Profile"));

import ProtectedRoute from "../pages/admin/ProtectedRoute";

export const publicRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/", element: <Home /> },
  { path: "/jobs", element: <Jobs /> },
  { path: "/browse", element: <Browse /> },
  { path: "/jobs/:id", element: <JobDescription /> },
  { path: "/profile", element: <ProtectedRoute allowedRoles={['student', 'recruiter', 'admin', 'superadmin']}><Profile /></ProtectedRoute> },
];
