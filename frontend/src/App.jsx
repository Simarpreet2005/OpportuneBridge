import { Suspense, useEffect } from "react"
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import Navbar from "./layout/Navbar"
import ErrorBoundary from "./ui/ErrorBoundary"
import RouteFallback from "./ui/RouteFallback"

import { publicRoutes } from "./routes/publicRoutes"
import { studentRoutes } from "./routes/studentRoutes"
import { adminRoutes } from "./routes/adminRoutes"
import { superAdminRoutes } from "./routes/superAdminRoutes"

import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDispatch } from "react-redux";
import { BASE_URL } from "./constants/api";
import { setLoading } from "./store/authSlice";

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
      ...publicRoutes,
      ...studentRoutes,
      ...adminRoutes,
      ...superAdminRoutes
    ]
  }
])

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(false));
    // Silently ping backend to wake it up from Render cold start
    fetch(`${BASE_URL}/health`).catch(() => {});
  }, [dispatch]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={appRouter} />
    </GoogleOAuthProvider>
  )
}

export default App
