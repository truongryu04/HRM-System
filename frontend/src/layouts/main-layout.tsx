import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";

export function MainLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

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
