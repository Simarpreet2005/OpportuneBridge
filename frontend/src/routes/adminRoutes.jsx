import { lazy } from "react";
import ProtectedRoute from "../pages/admin/ProtectedRoute";

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const Companies = lazy(() => import("../pages/admin/Companies"));
const CompanyCreate = lazy(() => import("../pages/admin/CompanyCreate"));
const CompanySetup = lazy(() => import("../pages/admin/CompanySetup"));
const AdminJobs = lazy(() => import("../pages/admin/AdminJobs"));
const PostJob = lazy(() => import("../pages/admin/PostJob"));
const Applicants = lazy(() => import("../pages/admin/Applicants"));

export const adminRoutes = [
  { path: "/admin/dashboard", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><AdminDashboard /></ProtectedRoute> },
  { path: "/admin/companies", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><Companies /></ProtectedRoute> },
  { path: "/admin/companies/create", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><CompanyCreate /></ProtectedRoute> },
  { path: "/admin/companies/:id", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><CompanySetup /></ProtectedRoute> },
  { path: "/admin/jobs", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><AdminJobs /></ProtectedRoute> },
  { path: "/admin/jobs/create", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><PostJob /></ProtectedRoute> },
  { path: "/admin/jobs/:id/applicants", element: <ProtectedRoute allowedRoles={['recruiter', 'admin', 'superadmin']}><Applicants /></ProtectedRoute> },
];
