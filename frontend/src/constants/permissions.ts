export const PERMISSIONS = {
  ATTENDANCE: {
    READ: "attendance:read",
    READ_ALL: "attendance:read-all",
    READ_DASHBOARD: "attendance:read-dashboard",
    UPDATE: "attendance:update",
  },

  EMPLOYEE: {
    READ: "employee:read",
    READ_ALL: "employee:read-all",
    CREATE: "employee:create",
    UPDATE: "employee:update",
    DELETE: "employee:delete",
    UPDATE_STATUS: "employee:update-status",
  },

  USER: {
    READ: "user:read",
    CREATE: "user:create",
    UPDATE: "user:update",
    ASSIGN_ROLE: "user:assign-role",
    UPDATE_STATUS: "user:update-status",
    RESET_PASSWORD: "user:reset-password",
  },

  ROLE: {
    READ: "role:read",
    CREATE: "role:create",
    UPDATE: "role:update",
    DELETE: "role:delete",
    ASSIGN_PERMISSION: "role:permission",
  },

  PERMISSION: {
    READ: "permission:read",
  },

  DEPARTMENT: {
    READ: "department:read",
    CREATE: "department:create",
    UPDATE: "department:update",
    DELETE: "department:delete",
  },

  POSITION: {
    READ: "position:read",
    CREATE: "position:create",
    UPDATE: "position:update",
    DELETE: "position:delete",
  },

  WORK_SHIFT: {
    READ: "work-shift:read",
    CREATE: "work-shift:create",
    UPDATE: "work-shift:update",
    DELETE: "work-shift:delete",
  },

  REQUEST: {
    READ: "request:read",
    READ_ALL: "request:read-all",
    CREATE: "request:create",
    APPROVE: "request:approve",
    REJECT: "request:reject",
    CANCEL: "request:cancel",
  },

  REQUEST_TYPE: {
    READ: "request-type:read",
    CREATE: "request-type:create",
    UPDATE: "request-type:update",
    DELETE: "request-type:delete",
  },

  APPROVAL_FLOW: {
    READ: "approval-flow:read",
    CREATE: "approval-flow:create",
    UPDATE: "approval-flow:update",
    DELETE: "approval-flow:delete",
  },

  APPROVAL_FLOW_STEP: {
    READ: "approval-flow-step:read",
    CREATE: "approval-flow-step:create",
    UPDATE: "approval-flow-step:update",
    DELETE: "approval-flow-step:delete",
  },

  APPROVAL_STEP_TEMPLATE: {
    READ: "approval-step-template:read",
    CREATE: "approval-step-template:create",
    UPDATE: "approval-step-template:update",
    DELETE: "approval-step-template:delete",
  },
} as const;

export type PermissionCode = {
  [Group in keyof typeof PERMISSIONS]: (typeof PERMISSIONS)[Group][keyof (typeof PERMISSIONS)[Group]];
}[keyof typeof PERMISSIONS];
