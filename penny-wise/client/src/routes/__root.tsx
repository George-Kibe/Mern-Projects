import Navigation from "@/components/Common/Navigation";
import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { matches } = useRouterState();

  const activeMatch = matches[matches.length - 1];

  const { title = "PennyWise" } = activeMatch.context as { title: string };

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
