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
import LeaveTypePage from "../pages/leave-type/LeaveTypePage";
import LeaveBalanceManagementPage from "../pages/leave-balance/LeaveBalanceManagementPage";
import PermissionRoute from "../guards/PermissionRoute";
import ForbiddenPage from "../pages/error/ForbiddenPage";
import { PERMISSIONS } from "../constants/permissions";

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
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.ATTENDANCE.READ]}>
                <AttendanceManagementPage />
              </PermissionRoute>
            ),
          },
          {
            path: "requests/my",
            element: <RequestPage />,
          },
          {
            path: "requests/approval",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.REQUEST.READ]}>
                <RequestApprovalPage />
              </PermissionRoute>
            ),
          },
          {
            path: "requests/approval/:id",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.REQUEST.READ]}>
                <RequestApprovalDetailPage />
              </PermissionRoute>
            ),
          },
          {
            path: "requests/create",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.REQUEST.CREATE]}>
                <RequestCreatePage />
              </PermissionRoute>
            ),
          },
          {
            path: "request-types",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.REQUEST_TYPE.READ]}>
                <RequestTypePage />
              </PermissionRoute>
            ),
          },
          {
            path: "approval-flows",
            element: (
              <PermissionRoute
                allPermissions={[PERMISSIONS.APPROVAL_FLOW.READ]}
              >
                <ApprovalFlowManagementPage />
              </PermissionRoute>
            ),
          },
          {
            path: "approval-step-templates",
            element: (
              <PermissionRoute
                allPermissions={[PERMISSIONS.APPROVAL_STEP_TEMPLATE.READ]}
              >
                <ApprovalStepTemplatePage />
              </PermissionRoute>
            ),
          },
          {
            path: "permissions",
            element: (
              <PermissionRoute
                allPermissions={[
                  PERMISSIONS.PERMISSION.READ,
                  PERMISSIONS.ROLE.READ,
                ]}
              >
                <PermissionPage />
              </PermissionRoute>
            ),
          },
          {
            path: "roles",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.ROLE.READ]}>
                <RolePage />
              </PermissionRoute>
            ),
          },
          {
            path: "users",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.USER.READ]}>
                <UserManagementPage />
              </PermissionRoute>
            ),
          },
          {
            path: "departments",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.DEPARTMENT.READ]}>
                <DepartmentPage />
              </PermissionRoute>
            ),
          },
          {
            path: "employees",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.EMPLOYEE.READ]}>
                <EmployeePage />
              </PermissionRoute>
            ),
          },
          {
            path: "employees/:id",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.EMPLOYEE.READ]}>
                <EmployeeDetailPage />
              </PermissionRoute>
            ),
          },
          {
            path: "employees/:id/edit",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.EMPLOYEE.UPDATE]}>
                <EmployeeEditPage />
              </PermissionRoute>
            ),
          },
          {
            path: "employees/create",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.EMPLOYEE.CREATE]}>
                <EmployeeCreatePage />
              </PermissionRoute>
            ),
          },
          {
            path: "positions",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.POSITION.READ]}>
                <PositionPage />
              </PermissionRoute>
            ),
          },
          {
            path: "leave-types",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.LEAVE_TYPE.READ]}>
                <LeaveTypePage />
              </PermissionRoute>
            ),
          },
          {
            path: "leave-balances",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.EMPLOYEE.READ]}>
                <LeaveBalanceManagementPage />
              </PermissionRoute>
            ),
          },
          {
            path: "work-shifts",
            element: (
              <PermissionRoute allPermissions={[PERMISSIONS.WORK_SHIFT.READ]}>
                <WorkShiftPage />
              </PermissionRoute>
            ),
          },
          {
            path: "profile",
            element: <EmployeeProfilePage />,
          },
          {
            path: "profile/edit",
            element: <EmployeeProfileEditPage />,
          },
          {
            path: "forbidden",
            element: <ForbiddenPage />,
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
