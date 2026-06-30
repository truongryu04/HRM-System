import { createBrowserRouter, Navigate } from "react-router-dom";

import TestPage from "../pages/TestPage";
import { MainLayout } from "../layouts/main-layout";
import PermissionPage from "../pages/permission/PermissionPage";
import RolePage from "../pages/role/RolePage";
import LoginPage from "../pages/auth/LoginPage";

import ProtectedRoute from "../guards/ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/permissions" replace />,
          },
          {
            path: "permissions",
            element: <PermissionPage />,
          },
          {
            path: "roles",
            element: <RolePage />,
          },
        ],
      },

      {
        path: "/test",
        element: <TestPage />,
      },
    ],
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
