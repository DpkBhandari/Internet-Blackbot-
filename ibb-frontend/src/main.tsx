import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

// Apply saved theme before paint to avoid flash
const saved = JSON.parse(localStorage.getItem("ibb-ui") || "{}");
if (saved?.state?.theme !== "light") document.documentElement.classList.add("dark");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgb(var(--elevated))",
              color: "rgb(var(--text))",
              border: "1px solid rgb(var(--border))",
              borderRadius: "10px",
              fontSize: "13px",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "rgb(var(--success))", secondary: "#fff" } },
            error: { iconTheme: { primary: "rgb(var(--danger))", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
