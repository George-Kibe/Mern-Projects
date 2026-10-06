import Navigation from "@/components/Common/Navigation";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

export default function RootLayout() {
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
