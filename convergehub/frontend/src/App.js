import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import ChannelList from "./components/ChannelList";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import CollaborativeEditor from "./components/CollaborativeEditor";
import FileSharing from "./components/FileSharing";
import TaskManagement from "./components/TaskManagement";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Set loading to false once auth state is checked
    });

    return () => unsubscribe();
  }, []);

  // Show a loading spinner while checking auth state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div style={styles.app}>
        <Navbar user={user} />
        <div style={styles.content}>
          <ChannelList />
          <AppRoutes user={user} />
        </div>
      </div>
    </Router>
  );
}

// ✅ AppRoutes Component (All Routes here)
function AppRoutes({ user }) {
  return (
    <Routes>
      {/* ✅ Chat Page */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute user={user}>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* ✅ Collaborative Editor */}
      <Route
        path="/editor"
        element={
          <ProtectedRoute user={user}>
            <CollaborativeEditor />
          </ProtectedRoute>
        }
      />

      {/* ✅ File Sharing */}
      <Route
        path="/file-sharing"
        element={
          <ProtectedRoute user={user}>
            <FileSharing />
          </ProtectedRoute>
        }
      />

      {/* ✅ Task Management */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute user={user}>
            <TaskManagement />
          </ProtectedRoute>
        }
      />

      {/* ✅ Support Page */}
      <Route
        path="/support"
        element={
          <ProtectedRoute user={user}>
            <h2>Support & Help Desk</h2>
          </ProtectedRoute>
        }
      />

      {/* ✅ Login/Signup */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />} // Redirect to home if logged in
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" /> : <Signup />} // Redirect to home if logged in
      />

      {/* ✅ Welcome Page */}
      <Route
        path="/"
        element={
          <div style={styles.welcome}>
            Welcome to ConvergeHub!
            {user && <p>Hello, {user.displayName || user.email}!</p>}
          </div>
        }
      />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

const styles = {
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  content: {
    display: "flex",
    flex: 1,
  },
  welcome: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
  },
};

export default App;