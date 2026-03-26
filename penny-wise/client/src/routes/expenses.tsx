import ExpensesPage from "@/pages/ExpensesPage";
import { useAuthStore } from "@/store/authStore";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/expenses")({
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

  component: ExpensesPage,
  context: () => ({
    title: "Expenses - PennyWise",
  }),
});
