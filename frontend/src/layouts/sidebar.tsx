import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { cn } from "../lib/utils";

type NavItem = {
  to: string;
  label: string;
};

type NavGroup = {
  label: string;
  children: NavItem[];
};

const navItems: Array<NavItem | NavGroup> = [
  { to: "/", label: "Lịch làm việc" },
  { to: "/attendance", label: "Quản lý chấm công" },
  {
    label: "Các yêu cầu",
    children: [
      { to: "/requests/my", label: "Yêu cầu của tôi" },
      { to: "/requests/approval", label: "Yêu cầu cần duyệt" },
    ],
  },
  {
    label: "Cấu hình",
    children: [
      { to: "/request-types", label: "Loại yêu cầu" },
      { to: "/approval-flows", label: "Luồng duyệt" },
      { to: "/work-shifts", label: "Ca làm việc" },
    ],
  },
  { to: "/permissions", label: "Phân quyền" },
  { to: "/roles", label: "Vai trò" },
  { to: "/employees", label: "Nhân viên" },
  { to: "/users", label: "Tài khoản" },
  { to: "/departments", label: "Phòng ban" },
  { to: "/positions", label: "Vị trí" },
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
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(() =>
    getActiveGroupLabel(location.pathname),
  );

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 text-xl font-bold">HRM System</div>

      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
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
