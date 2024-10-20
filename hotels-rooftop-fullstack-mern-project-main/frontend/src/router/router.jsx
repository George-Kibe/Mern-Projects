import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Blogs from "../pages/blogs/Blogs";
import About from "../pages/miniPage/About";
import PrivacyPolicy from "../pages/miniPage/PrivacyPolicy";
import ContactUs from "../pages/miniPage/ContactUs";
import SingleBlog from "../pages/blogs/singleBlog/SingleBlog";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import PrivateRoute from "./PrivateRoute";
import AdminLayout from "../pages/admin/AdminLayout";
import AddPost from "../pages/admin/post/AddPost";
import ManagePost from "../pages/admin/post/ManagePosts";
import ManageUser from "../pages/admin/user/ManageUser";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import UpdatePosts from "../pages/admin/post/UpdatePosts";
import ErrorPage from "../components/ErrorPage";



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/blogs",
        element: <Blogs/>
      },
      {
        path: "/blogs/:id",
        element:<SingleBlog /> ,
      },
      {
        path: "/about-us",
        element: <About/>
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy/>
      },
      {
        path: "/contact-us",
        element: <ContactUs/>
      },
      // login & registration
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      },
      {
        path: 'dashboard',
        element: <PrivateRoute><AdminLayout /></PrivateRoute>, // Use AdminLayout for admin routes
        children: [
          // Define admin routes here
          {
            path: '',
            element: <Dashboard/>,
          },
          {
            path: 'add-new-post',
            element: <AddPost/>,
          },
          {
            path: 'manage-items',
            element: <ManagePost/>,
          },
          {
            path: "update-items/:id",
            element: <UpdatePosts/>
          },
          {
            path: 'users',
            element: <ManageUser/>,
          }
          
        ],
      },

    ]
  },
]);

export default router;
