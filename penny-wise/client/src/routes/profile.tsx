import ProfilePage from "@/pages/ProfilePage";
import { useAuthStore } from "@/store/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
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

  component: ProfilePage,
  context: () => ({
    title: "Profile - PennyWise",
  }),
});
