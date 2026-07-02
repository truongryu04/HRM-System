import { createBrowserRouter, Navigate } from "react-router-dom";

import TestPage from "../pages/TestPage";
import { MainLayout } from "../layouts/main-layout";
import PermissionPage from "../pages/permission/PermissionPage";
import RolePage from "../pages/role/RolePage";
import LoginPage from "../pages/auth/LoginPage";

import ProtectedRoute from "../guards/ProtectedRoute";
import UserManagementPage from "../pages/user/UserManagementPage";
import DepartmentPage from "../pages/department/DepartmentPage";
import PositionPage from "../pages/position/PositionPage";
import EmployeePage from "../pages/employee/EmployeePage";
import EmployeeDetailPage from "../pages/employee/EmployeeDetailPage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";

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
          {
            path: "users",
            element: <UserManagementPage />,
          },
          {
            path: "departments",
            element: <DepartmentPage />,
          },
          {
            path: "employees",
            element: <EmployeePage />,
          },
          {
            path: "employees/id",
            element: <EmployeeDetailPage />,
          },
          {
            path: "employees/id/edit",
            element: <EmployeeEditPage />,
          },
          {
            path: "employees/create",
            element: <EmployeeCreatePage />,
          },
          {
            path: "positions",
            element: <PositionPage />,
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
