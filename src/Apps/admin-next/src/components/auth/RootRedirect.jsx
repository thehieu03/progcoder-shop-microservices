import { useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/contexts/KeycloakContext";
import Loading from "@/components/Loading";

const Ecommerce = lazy(() => import("@/pages/dashboard/ecommerce"));

const RootRedirect = () => {
  const router = useRouter();
  const { authenticated, keycloakReady } = useKeycloak();

  useEffect(() => {
    if (!keycloakReady) {
      return;
    }

    if (!authenticated) {
      // If not authenticated, redirect to /login
      router.push("/login");
    }
  }, [authenticated, keycloakReady, router]);

  // If Keycloak is not ready, show loading
  if (!keycloakReady) {
    return <Loading />;
  }

  // If not authenticated, show loading while redirecting
  if (!authenticated) {
    return <Loading />;
  }

  // If authenticated, load ecommerce page directly
  return (
    <Suspense fallback={<Loading />}>
      <Ecommerce />
    </Suspense>
  );
};

export default RootRedirect;
