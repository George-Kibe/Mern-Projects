import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";


const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const token = document.cookie;
  const location = useLocation()

  if ( user) {
    return children;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
