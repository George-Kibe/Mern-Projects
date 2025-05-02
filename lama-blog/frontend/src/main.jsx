import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, BrowserRouter, Route, RouterProvider } from "react-router-dom";
import './index.css'
import Homepage from './pages/Homepage.jsx';
import PostsListPage from './pages/PostsListPage.jsx';
import WritePage from './pages/WritePage.jsx';
import SinglePostPage from './pages/SinglePostPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PrimaryLayout from './layouts/PrimaryLayout.jsx';
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}


const router = createBrowserRouter([
 {
  element: <PrimaryLayout />,
  children: [
    {
      path: "/",
      element: <Homepage />,
    },
    {
      path: "/posts",
      element: <PostsListPage />,
    },
    {
      path: "/posts/:slug",
      element: <SinglePostPage />,
    },
    {
      path: "/write",
      element: <WritePage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]
 }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
)
