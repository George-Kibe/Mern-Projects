import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ClerkProvider } from "@clerk/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { shouldRetry } from "./lib/api";
import PrimaryLayout from "./layouts/PrimaryLayout.jsx";
import Homepage from "./pages/Homepage.jsx";
import PostsListPage from "./pages/PostsListPage.jsx";
import SinglePostPage from "./pages/SinglePostPage.jsx";
import WritePage from "./pages/WritePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Every full page load gets the location key "default", so React Router would
// restore the scroll position of whichever page was last loaded fresh. Only a
// real reload should restore; a fresh visit starts at the top.
try {
  const navigation = performance.getEntriesByType("navigation")[0];
  if (navigation?.type !== "reload") {
    const storageKey = "react-router-scroll-positions";
    const positions = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    delete positions.default;
    sessionStorage.setItem(storageKey, JSON.stringify(positions));
  }
} catch {
  // Storage can be unavailable (private mode); scrolling just starts at the top.
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // Avoid surprise refetch bursts that eat into the API rate limit.
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <PrimaryLayout />,
    children: [
      { path: "/", element: <Homepage /> },
      { path: "/posts", element: <PostsListPage /> },
      { path: "/posts/:slug", element: <SinglePostPage /> },
      { path: "/write", element: <WritePage /> },
      { path: "/login/*", element: <LoginPage /> },
      { path: "/register/*", element: <RegisterPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// Clerk's sign-in, sign-up and user menu in the blog's own palette.
const clerkAppearance = {
  variables: {
    colorPrimary: "#1e40af",
    colorText: "#14163a",
    colorTextSecondary: "#3f4370",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    fontFamily: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
    borderRadius: "12px",
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer position="bottom-right" autoClose={3500} newestOnTop limit={3} />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
);
