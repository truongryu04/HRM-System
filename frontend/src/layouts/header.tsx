import { Bell, User, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="font-semibold text-base">HRM System</h1>

      <div className="flex items-center gap-4">
        <Bell className="ml-2" size={20} />
        <Settings className="ml-2" size={20} />
        <User className="ml-2" size={20} />
      </div>
    </header>
  );
}
