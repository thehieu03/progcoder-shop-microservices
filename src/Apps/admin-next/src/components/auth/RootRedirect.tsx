"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/contexts/KeycloakContext";
import Loading from "@/components/Loading";

const RootRedirect= () => {
  const router = useRouter();
  const { authenticated, keycloakReady } = useKeycloak();

  useEffect(() => {
    if (!keycloakReady) return;

    if (authenticated) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [authenticated, keycloakReady, router]);

  return <Loading />;
};

export default RootRedirect;
