import { lazy } from "react";
import ProtectedRoute from "../pages/admin/ProtectedRoute";

const StudentDashboard = lazy(() => import("../pages/student/StudentDashboard"));
const CareerAssistant = lazy(() => import("../components/CareerAssistant"));
const SavedJobs = lazy(() => import("../pages/student/SavedJobs"));

export const studentRoutes = [
  { path: "/dashboard", element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
  { path: "/career-assistant", element: <ProtectedRoute allowedRoles={['student']}><CareerAssistant /></ProtectedRoute> },
  { path: "/saved-jobs", element: <ProtectedRoute allowedRoles={['student']}><SavedJobs /></ProtectedRoute> },
];
