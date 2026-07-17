import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
          <div className="flex min-h-full flex-col">
            <main className="flex-1 p-4 sm:p-6">
              <Outlet />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
