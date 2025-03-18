import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, children }) {
  // If the user is not signed in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is signed in, render the children (protected content)
  return children;
}

export default ProtectedRoute;