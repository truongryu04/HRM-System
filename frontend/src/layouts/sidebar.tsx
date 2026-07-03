import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 font-bold text-xl">HRM System</div>

      <nav className="space-y-1 p-2">
        <NavLink
          to="/attendance"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Lịch làm việc
        </NavLink>
        <NavLink
          to="/permissions"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Phân quyền
        </NavLink>

        <NavLink
          to="/roles"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Vai trò
        </NavLink>

        <NavLink
          to="/employees"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Nhân viên
        </NavLink>
        <NavLink
          to="/users"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Tài khoản
        </NavLink>

        <NavLink
          to="/departments"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Phòng ban
        </NavLink>
        <NavLink
          to="/positions"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Vị trí
        </NavLink>
      </nav>
    </aside>
  );
}
