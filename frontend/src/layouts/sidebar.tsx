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
    label: "Quản lý chấm công & phép",
    children: [
      {
        to: "/attendance",
        label: "Quản lý chấm công",
        allPermissions: [PERMISSIONS.ATTENDANCE.READ],
      },
      {
        to: "/leave-balances",
        label: "Quản lý số dư phép",
        allPermissions: [
          PERMISSIONS.LEAVE_BALANCE.READ,
          PERMISSIONS.EMPLOYEE.READ,
          PERMISSIONS.LEAVE_TYPE.READ,
        ],
      },
    ],
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
        to: "/leave-types",
        label: "Loại nghỉ phép",
        allPermissions: [PERMISSIONS.LEAVE_TYPE.READ],
      },
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

type SidebarProps = {
  isOpen: boolean;
};

export function Sidebar({ isOpen }: SidebarProps) {
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
    <aside
      id="main-sidebar"
      hidden={!isOpen}
      className="flex w-64 shrink-0 flex-col border-r border-primary-hover/25 bg-primary text-white shadow-sm"
    >
      <div className="flex h-16 shrink-0 items-center border-b border-primary-foreground/15 px-5">
        <div className="text-xl font-bold tracking-tight">HRM System</div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover-foreground/70",
                  isActive && "bg-primary-hover shadow-sm",
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
                    "size-4 shrink-0 opacity-75 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div className="mt-1 ml-3 space-y-1 border-l border-primary-foreground/20 pl-2">
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
        "block rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-hover-foreground/70",
        nested && "py-2 text-[13px] text-white",
        isActive && "bg-primary-hover shadow-sm",
      )}
    >
      {item.label}
    </NavLink>
  );
}
