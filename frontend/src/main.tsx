import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { AppProviders } from "./app/providers.tsx";
import { router } from "./routes";
import { Toaster } from "sonner";
createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <RouterProvider router={router} />
    <Toaster />
  </AppProviders>,
);
