"use client";
import React from "react";
import StoreProvider from "./StoreProvider";
import { KeycloakProvider } from "../contexts/KeycloakContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import global styles that were in main.jsx
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "../assets/css/app.css";
import "../i18n/config"; // Initialize i18n

// Import MirageJS server
import { makeServer } from "@/core/api/mockServer";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize MirageJS Mock Server
  React.useEffect(() => {
    // Check if mock data is enabled
    const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMockData && typeof window !== "undefined") {
      // Avoid starting twice in strict mode
      // @ts-ignore
      if (!window.server) {
        // @ts-ignore
        window.server = makeServer({ environment: "development" });
        console.log("MirageJS Mock Server initialized");
      }
    }
  }, []);

  return (
    <StoreProvider>
      <KeycloakProvider>
        {children}
        <ToastContainer />
      </KeycloakProvider>
    </StoreProvider>
  );
}
