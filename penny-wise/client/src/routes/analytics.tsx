import AnalyticsPage from "@/pages/AnalyticsPage";
import { useAuthStore } from "@/store/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/analytics")({
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

  component: AnalyticsPage,
  context: () => ({
    title: "Analytics - PennyWise",
  }),
});
