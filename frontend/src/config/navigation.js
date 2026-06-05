export const getNavigationLinks = (user) => {
  const role = user?.role || 'guest';

  const links = {
    guest: [
      { path: "/", label: "Home", isButton: false },
      { path: "/jobs", label: "Find Jobs", isButton: false },
      { path: "/saved-jobs", label: "Saved Jobs", isButton: false, protected: true, message: "Please login to view saved jobs" },
      { path: "/career-assistant", label: "Career Assistant", isButton: false, protected: true, message: "Please login to access career assistant" },
    ],
    student: [
      { path: "/", label: "Home", isButton: false },
      { path: "/dashboard", label: "Dashboard", isButton: false },
      { path: "/jobs", label: "Find Jobs", isButton: false },
      { path: "/saved-jobs", label: "Saved Jobs", isButton: false },
      { path: "/career-assistant", label: "Career Assistant", isButton: false },
    ],
    recruiter: [
      { path: "/admin/dashboard", label: "Dashboard", isButton: false },
      { path: "/admin/companies", label: "Companies", isButton: false },
      { path: "/admin/jobs", label: "Jobs", isButton: false },
    ],
    admin: [
      { path: "/admin/dashboard", label: "Dashboard", isButton: false },
      { path: "/admin/companies", label: "Companies", isButton: false },
      { path: "/admin/jobs", label: "Jobs", isButton: false },
    ],
    superadmin: [
      { path: "/superadmin/dashboard", label: "Dashboard", isButton: false },
      { path: "/superadmin/users", label: "Users", isButton: false },
      { path: "/superadmin/analytics", label: "Analytics", isButton: false },
    ]
  };

  return links[role] || links.guest;
};
