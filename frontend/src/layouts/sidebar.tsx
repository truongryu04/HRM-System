import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/request-types", label: "Loại yêu cầu" },
  { to: "/approval-flows", label: "Luồng duyệt" },
  { to: "/attendance/my", label: "Lịch làm việc" },
  { to: "/attendance", label: "Quản lý chấm công" },
  { to: "/requests/my", label: "Yêu cầu của tôi" },
  { to: "/requests/approval", label: "Yêu cầu cần duyệt" },
  { to: "/permissions", label: "Phân quyền" },
  { to: "/roles", label: "Vai trò" },
  { to: "/employees", label: "Nhân viên" },
  { to: "/users", label: "Tài khoản" },
  { to: "/departments", label: "Phòng ban" },
  { to: "/positions", label: "Vị trí" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 font-bold text-xl">HRM System</div>

      <nav className="space-y-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="block rounded-md px-3 py-2 hover:bg-muted"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
