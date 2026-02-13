"use client";
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useKeycloak } from "@/contexts/KeycloakContext";

const LoginForm = () => {
  const { t } = useTranslation();
  const { login, keycloakReady } = useKeycloak();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!keycloakReady) return;

    if (process.env.NEXT_PUBLIC_MOCK_AUTH === "true") {
      const isValidDemoLogin = username.trim() === "admin" && password === "admin";
      if (!isValidDemoLogin) {
        setError("Sai tai khoan hoac mat khau. Dung admin/admin de dang nhap.");
        return;
      }
    }

    login();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm text-slate-600 dark:text-slate-300" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700"
          placeholder="admin"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-slate-600 dark:text-slate-300" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700"
          placeholder="admin"
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        text={t("common.signIn")}
        className="btn btn-dark block w-full text-center"
        isLoading={!keycloakReady}
      />
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        {t("auth.signInToAccount")}
      </p>
    </form>
  );
};

export default LoginForm;
