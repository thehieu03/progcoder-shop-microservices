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

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <KeycloakProvider>
        {children}
        <ToastContainer />
      </KeycloakProvider>
    </StoreProvider>
  );
}
