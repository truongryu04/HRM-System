import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia("(min-width: 1024px)").matches,
  );

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };

    desktopQuery.addEventListener("change", handleBreakpointChange);
    return () =>
      desktopQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !window.matchMedia("(min-width: 1024px)").matches
      ) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  const closeMobileSidebar = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onNavigate={closeMobileSidebar} />
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Đóng thanh bên"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
          <div className="flex min-h-full flex-col">
            <main className="min-w-0 flex-1 p-3 sm:p-6">
              <Outlet />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
