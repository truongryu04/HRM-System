import { createBrowserRouter, Navigate } from "react-router-dom";

import { MainLayout } from "../layouts/main-layout";
import PermissionPage from "../pages/permission/PermissionPage";
import RolePage from "../pages/role/RolePage";
import LoginPage from "../pages/auth/LoginPage";
import ActivateAccountPage from "../pages/auth/ActivateAccountPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import WorkShiftPage from "../pages/work-shift/WorkShiftPage";
import EmployeeProfilePage from "../pages/profile/EmployeeProfilePage";
import EmployeeProfileEditPage from "../pages/profile/EmployeeProfileEditPage";

import ProtectedRoute from "../guards/ProtectedRoute";
import UserManagementPage from "../pages/user/UserManagementPage";
import DepartmentPage from "../pages/department/DepartmentPage";
import PositionPage from "../pages/position/PositionPage";
import EmployeePage from "../pages/employee/EmployeePage";
import EmployeeDetailPage from "../pages/employee/EmployeeDetailPage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";
import AttendancePage from "../pages/attendance/AttendancePage";
import AttendanceManagementPage from "../pages/attendance/AttendanceManagementPage";
import RequestPage from "../pages/request/RequestPage";
import RequestCreatePage from "../pages/request/RequestCreatePage";
import RequestApprovalPage from "../pages/request-approval/RequestApprovalPage";
import RequestApprovalDetailPage from "../pages/request-approval/RequestApprovalDetailPage";
import RequestTypePage from "../pages/request-type/RequestTypePage";
import ApprovalFlowManagementPage from "../pages/approval-flow/ApprovalFlowManagementPage";
import ApprovalStepTemplatePage from "../pages/approval-step-template/ApprovalStepTemplatePage";

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
            element: <AttendancePage />,
          },
          {
            path: "attendance/my",
            element: <Navigate to="/" replace />,
          },
          {
            path: "attendance",
            element: <AttendanceManagementPage />,
          },
          {
            path: "requests/my",
            element: <RequestPage />,
          },
          {
            path: "requests/approval",
            element: <RequestApprovalPage />,
          },
          {
            path: "requests/approval/:id",
            element: <RequestApprovalDetailPage />,
          },
          {
            path: "requests/create",
            element: <RequestCreatePage />,
          },
          {
            path: "request-types",
            element: <RequestTypePage />,
          },
          {
            path: "approval-flows",
            element: <ApprovalFlowManagementPage />,
          },
          {
            path: "approval-step-templates",
            element: <ApprovalStepTemplatePage />,
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
            path: "employees/:id",
            element: <EmployeeDetailPage />,
          },
          {
            path: "employees/:id/edit",
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
          {
            path: "work-shifts",
            element: <WorkShiftPage />,
          },
          {
            path: "profile",
            element: <EmployeeProfilePage />,
          },
          {
            path: "profile/edit",
            element: <EmployeeProfileEditPage />,
          },
        ],
      },
    ],
  },

  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/activate-account",
    element: <ActivateAccountPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
