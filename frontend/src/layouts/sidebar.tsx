import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { cn } from "../lib/utils";
import { PERMISSIONS, type PermissionCode } from "../constants/permissions";
import { usePermissionAccess } from "../hooks/usePermissionAccess";

type PermissionRequirement = {
  anyPermissions?: readonly PermissionCode[];
  allPermissions?: readonly PermissionCode[];
};

type NavItem = PermissionRequirement & {
  to: string;
  label: string;
};

type NavGroup = PermissionRequirement & {
  label: string;
  children: NavItem[];
};

const navItems: Array<NavItem | NavGroup> = [
  { to: "/", label: "Lịch làm việc" },
  {
    to: "/attendance",
    label: "Quản lý chấm công",
    allPermissions: [PERMISSIONS.ATTENDANCE.READ],
  },
  {
    label: "Các yêu cầu",
    children: [
      { to: "/requests/my", label: "Yêu cầu của tôi" },
      {
        to: "/requests/approval",
        label: "Yêu cầu cần duyệt",
        allPermissions: [PERMISSIONS.REQUEST.READ],
      },
    ],
  },
  {
    label: "Cấu hình",
    children: [
      {
        to: "/request-types",
        label: "Loại yêu cầu",
        allPermissions: [PERMISSIONS.REQUEST_TYPE.READ],
      },
      {
        to: "/approval-flows",
        label: "Luồng duyệt",
        allPermissions: [PERMISSIONS.APPROVAL_FLOW.READ],
      },
      {
        to: "/approval-step-templates",
        label: "Mẫu bước duyệt",
        allPermissions: [PERMISSIONS.APPROVAL_STEP_TEMPLATE.READ],
      },
      {
        to: "/work-shifts",
        label: "Ca làm việc",
        allPermissions: [PERMISSIONS.WORK_SHIFT.READ],
      },
    ],
  },
  {
    to: "/permissions",
    label: "Phân quyền",
    allPermissions: [PERMISSIONS.PERMISSION.READ, PERMISSIONS.ROLE.READ],
  },
  { to: "/roles", label: "Vai trò", allPermissions: [PERMISSIONS.ROLE.READ] },
  {
    to: "/employees",
    label: "Nhân viên",
    allPermissions: [PERMISSIONS.EMPLOYEE.READ],
  },
  { to: "/users", label: "Tài khoản", allPermissions: [PERMISSIONS.USER.READ] },
  {
    to: "/departments",
    label: "Phòng ban",
    allPermissions: [PERMISSIONS.DEPARTMENT.READ],
  },
  {
    to: "/positions",
    label: "Vị trí",
    allPermissions: [PERMISSIONS.POSITION.READ],
  },
];

function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "children" in item;
}

function isSidebarLinkActive(pathname: string, to: string) {
  if (to === "/requests/approval") {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return pathname === to;
}

function isSidebarGroupActive(pathname: string, group: NavGroup) {
  return group.children.some((child) =>
    isSidebarLinkActive(pathname, child.to),
  );
}

function getActiveGroupLabel(pathname: string) {
  const activeGroup = navItems.find(
    (item): item is NavGroup =>
      isNavGroup(item) && isSidebarGroupActive(pathname, item),
  );

  return activeGroup?.label ?? null;
}

export function Sidebar() {
  const location = useLocation();
  const { canAll, canAny } = usePermissionAccess();
  const isAllowed = (item: PermissionRequirement) =>
    (!item.allPermissions?.length || canAll(item.allPermissions)) &&
    (!item.anyPermissions?.length || canAny(item.anyPermissions));
  const visibleNavItems = navItems.reduce<Array<NavItem | NavGroup>>(
    (items, item) => {
      if (!isAllowed(item)) return items;
      if (!isNavGroup(item)) return [...items, item];

      const children = item.children.filter(isAllowed);
      return children.length ? [...items, { ...item, children }] : items;
    },
    [],
  );
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(() =>
    getActiveGroupLabel(location.pathname),
  );

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 text-xl font-bold">HRM System</div>

      <nav className="space-y-1 p-2">
        {visibleNavItems.map((item) => {
          if (!isNavGroup(item)) {
            return <SidebarLink key={item.to} item={item} />;
          }

          const isOpen = openGroupLabel === item.label;
          const isActive = isSidebarGroupActive(location.pathname, item);

          return (
            <div key={item.label}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted",
                  isActive && "bg-muted font-medium",
                )}
                onClick={() =>
                  setOpenGroupLabel((currentLabel) =>
                    currentLabel === item.label ? null : item.label,
                  )
                }
                aria-expanded={isOpen}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div className="mt-1 space-y-1 pl-4">
                  {item.children.map((child) => (
                    <SidebarLink key={child.to} item={child} nested />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function SidebarLink({
  item,
  nested = false,
}: {
  item: NavItem;
  nested?: boolean;
}) {
  const location = useLocation();
  const isActive = isSidebarLinkActive(location.pathname, item.to);

  return (
    <NavLink
      to={item.to}
      className={cn(
        "block rounded-md px-3 py-2 hover:bg-muted",
        nested && "text-sm text-muted-foreground",
        isActive && "bg-muted font-medium text-foreground",
      )}
    >
      {item.label}
    </NavLink>
  );
}
