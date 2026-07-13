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
  { to: "/request-types", label: "Loại yêu cầu" },
  { to: "/approval-flows", label: "Luồng duyệt" },

  { to: "/attendance", label: "Quản lý chấm công" },
  {
    label: "Các yêu cầu",
    children: [
      { to: "/requests/my", label: "Yêu cầu của tôi" },
      { to: "/requests/approval", label: "Yêu cầu cần duyệt" },
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

function isRequestRoute(pathname: string) {
  return pathname.startsWith("/requests");
}

function isSidebarLinkActive(pathname: string, to: string) {
  if (to === "/requests/approval") {
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  return pathname === to;
}

export function Sidebar() {
  const location = useLocation();
  const [requestsOpen, setRequestsOpen] = useState(() =>
    isRequestRoute(location.pathname),
  );
  const showRequestsGroup = requestsOpen || isRequestRoute(location.pathname);

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 text-xl font-bold">HRM System</div>

      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          if (!isNavGroup(item)) {
            return <SidebarLink key={item.to} item={item} />;
          }

          return (
            <div key={item.label}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-muted",
                  isRequestRoute(location.pathname) && "bg-muted font-medium",
                )}
                onClick={() => setRequestsOpen((open) => !open)}
                aria-expanded={showRequestsGroup}
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    showRequestsGroup && "rotate-180",
                  )}
                />
              </button>

              {showRequestsGroup ? (
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
