"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import useDarkMode from "@/hooks/useDarkMode";
import { useTranslation } from "react-i18next";
import { useKeycloak } from "@/contexts/KeycloakContext";
import Image from "next/image";

// image import
import LogoWhite from "@/assets/images/logo/logo-white.svg";
import Logo from "@/assets/images/logo/logo.png";

const Login = () => {
  const [isDark] = useDarkMode();
  const { t } = useTranslation();
  const { authenticated, keycloakReady } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to / (root - ecommerce page)
    if (keycloakReady && authenticated) {
      router.replace("/");
    }
  }, [authenticated, keycloakReady, router]);

  return (
    <div className="loginwrapper min-h-screen flex items-center justify-center bg-white dark:bg-slate-800">
      <div className="w-full max-w-md">
        <div className="inner-content flex flex-col bg-white dark:bg-slate-800">
          <div className="auth-box flex flex-col justify-center">
            <div className="logo text-center mb-6">
              <Link href="/">
                <Image
                  src={isDark ? LogoWhite : Logo}
                  alt=""
                  className="mx-auto"
                  width={150}
                  height={50}
                  priority
                />
              </Link>
            </div>
            <div className="text-center 2xl:mb-10 mb-4">
              <h4 className="font-medium">{t("auth.signIn")}</h4>
              <div className="text-slate-500 text-base">
                {t("auth.signInToAccount")}
              </div>
            </div>
            <LoginForm />
            {/* 
            // Commenting out Register link as it might not be implemented yet or handled by Keycloak
            <div className="md:max-w-[345px] mx-auto font-normal text-slate-500 dark:text-slate-400 mt-12 uppercase text-sm">
              {t("common.dontHaveAccount")}{" "}
              <Link
                href="/register"
                className="text-slate-900 dark:text-white font-medium hover:underline"
              >
                {t("common.signUp")}
              </Link>
            </div>
            */}
          </div>
          <div className="auth-footer text-center mt-8">
            {t("common.copyright")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
