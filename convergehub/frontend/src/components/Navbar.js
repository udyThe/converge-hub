import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import ProfileManagement from './ProfileManagement'; // Import the ProfileManagement component


function Navbar({ user }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false); // State for modal visibility

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    const handleProfileManagement = () => {
        setShowProfileModal(true); // Show the modal
        setShowDropdown(false); // Close the dropdown
    };

    return (
        <nav style={styles.nav}>
            <h1 style={styles.title}>ConvergeHub</h1>
            <ul style={styles.menu}>
                <li><Link to="/" style={styles.link}>Home</Link></li>

                {user ? (
                    <div style={styles.profileContainer}>
                        <button
                            style={styles.profileBtn}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <img
                                src={user.photoURL || "https://www.citypng.com/public/uploads/preview/white-user-member-guest-icon-png-image-701751695037005zdurfaim0y.png"}
                                alt=""
                                style={styles.profileIcon}
                            /> <a>{user.displayName}</a>
                        </button>
                        {showDropdown && (
                            <div style={styles.dropdown}>
                                <button onClick={handleProfileManagement}>Manage Profile</button>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <li><Link to="/login" style={styles.link}>Login</Link></li>
                        <li><Link to="/signup" style={styles.link}>Signup</Link></li>
                        
                    </>
                )}
            </ul>

            {/* Profile Management Modal */}
            {showProfileModal && (
                <div style={styles.modalOverlay}>
                    <ProfileManagement user={user} onClose={() => setShowProfileModal(false)} />
                </div>
            )}
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
    },
    title: {
        margin: 0,
        fontSize: '24px',
    },
    menu: {
        listStyle: 'none',
        display: 'flex',
        margin: 0,
        padding: 0,
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        marginLeft: '20px',
        fontSize: '18px',
    },
    profileContainer: {
        position: 'relative',
    },
    profileBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    profileIcon: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
    },
    dropdown: {
        position: 'absolute',
        top: '35px',
        right: '0',
        backgroundColor: '#fff',
        borderRadius: '5px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        zIndex: '10',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
};

export default Navbar;