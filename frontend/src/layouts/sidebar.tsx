import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4 font-bold text-xl">HRM System</div>

      <nav className="space-y-1 p-2">
        <NavLink
          to="/permissions"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Permissions
        </NavLink>

        <NavLink
          to="/roles"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Roles
        </NavLink>

        <NavLink
          to="/employees"
          className="block rounded-md px-3 py-2 hover:bg-muted"
        >
          Employees
        </NavLink>
      </nav>
    </aside>
  );
}
