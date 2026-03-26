import DashboardPage from "@/pages/DashboardPage";
import { useAuthStore } from "@/store/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",

        search: {
          redirect: "/dashboard",
        },
      });
    }
  },

  component: DashboardPage,
  context: () => ({
    title: "Dashboard - PennyWise",
  }),
});
