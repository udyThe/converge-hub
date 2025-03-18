import React, { useState } from "react";
import { auth } from "../firebase";
import { updateProfile, updateEmail, deleteUser } from "firebase/auth";
import { motion } from "framer-motion";
import "./ProfileManagement.css"; // Add your CSS file for styling

const ProfileManagement = ({ user, onClose }) => {
  const [username, setUsername] = useState(user.displayName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [error, setError] = useState("");

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: username });
      await updateEmail(auth.currentUser, email);
      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deleteUser(auth.currentUser);
        alert("Account deleted successfully!");
        onClose();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <motion.div
      className="profile-management-modal"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Manage Profile</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
      />
      <button onClick={handleUpdateProfile}>Update Profile</button>
      <button className="delete-btn" onClick={handleDeleteAccount}>
        Delete Account
      </button>
      <button onClick={onClose}>Close</button>
    </motion.div>
  );
};

export default ProfileManagement;