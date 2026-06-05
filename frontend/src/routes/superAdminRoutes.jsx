import { lazy } from "react";
import ProtectedRoute from "../pages/admin/ProtectedRoute";

const SuperAdminDashboard = lazy(() => import("../pages/admin/SuperAdminDashboard"));
const SuperAdminUsers = lazy(() => import("../pages/admin/SuperAdminUsers"));
const SuperAdminAnalytics = lazy(() => import("../pages/admin/SuperAdminAnalytics"));

export const superAdminRoutes = [
  { path: "/superadmin/dashboard", element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute> },
  { path: "/superadmin/users", element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminUsers /></ProtectedRoute> },
  { path: "/superadmin/analytics", element: <ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAnalytics /></ProtectedRoute> },
];
