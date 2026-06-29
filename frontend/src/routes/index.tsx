import { createBrowserRouter, Navigate } from "react-router-dom";
import TestPage from "../pages/TestPage";
import { MainLayout } from "../layouts/main-layout";
import PermissionPage from "../pages/permission/PermissionPage";
import RolePage from "../pages/role/RolePage";
import LoginPage from "../pages/auth/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
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
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
