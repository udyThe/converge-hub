import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./FriendList.css"; // Add your CSS file for styling
import ChatWindow from "./ChatWindow"; // Import the ChatWindow component

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(""); // Add error state
  const [friendUsernames, setFriendUsernames] = useState({}); // Object to store friendId -> username mapping
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Fetch the current user from Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Set the current user
      } else {
        setCurrentUser(null); // No user is signed in
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Fetch the user's friends list
  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser) return;

      const q = query(collection(db, "users"), where("uid", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs[0]?.data();
      setFriends(userData?.friends || []);
    };

    fetchFriends();
  }, [currentUser]);

  // Real-time search for users by username
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]); // Clear search results if search term is empty
      return;
    }

    const fetchSearchResults = async () => {
      const q = query(
        collection(db, "users"),
        where("username", ">=", searchTerm),
        where("username", "<=", searchTerm + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => doc.data());
      setSearchResults(results);
    };

    fetchSearchResults();
  }, [searchTerm]);

  // Add a friend
  const handleAddFriend = async (friendId, friendUsername) => {
    if (!currentUser) {
      console.error("No current user found.");
      return;
    }

    // Check if the friend is already added
    if (friends.includes(friendId)) {
      setError(`${friendUsername} is already your friend.`);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const friendRef = doc(db, "users", friendId);

    try {
      // Add friend to the current user's friends array
      await updateDoc(userRef, {
        friends: arrayUnion(friendId),
      });

      // Add current user to the friend's friends array
      await updateDoc(friendRef, {
        friends: arrayUnion(currentUser.uid),
      });

      setFriends((prev) => [...prev, friendId]); // Update local state
      setError(""); // Clear any previous error
    } catch (error) {
      console.error("Error adding friend:", error);
      setError("Failed to add friend. Please try again.");
    }
  };

  // Fetch usernames for all friends once the friends list is available
  useEffect(() => {
    const fetchFriendUsernames = async () => {
      if (!friends.length) return;

      const friendUsernamesMap = {};
      for (const friendId of friends) {
        const friendData = await getDocs(query(collection(db, "users"), where("uid", "==", friendId)));
        const user = friendData.docs[0]?.data();
        friendUsernamesMap[friendId] = user?.username || friendId; // Fallback to friendId if username not found
      }
      setFriendUsernames(friendUsernamesMap);
    };

    fetchFriendUsernames();
  }, [friends]);

  return (
    <div className="friend-list">
      <div className="friend-list-header">
        <h3>Friends</h3>
        <button onClick={() => setShowSearch(!showSearch)}>+ Add Friend</button>
      </div>

      {showSearch && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div key={user.uid} className="search-result-item">
                  <span>{user.username}</span>
                  <button onClick={() => handleAddFriend(user.uid, user.username)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Display error message */}
      {error && <p className="error-message">{error}</p>}

      <div className="friends">
        {friends.length > 0 ? (
          friends.map((friendId) => {
            // Get the username for each friend from the friendUsernames object
            const friendUsername = friendUsernames[friendId] || friendId;

            return (
              <div
                key={friendId} className="friend-item"
                onClick={() => setSelectedFriend({ id: friendId, username: friendUsername })}
              >                
              <span>{friendUsername}</span>
              </div>
            );
          })
        ) : (
          <p>Add friends to see them here.</p>
        )}
      </div>
      {/* Render ChatWindow if a friend is selected */}
      {selectedFriend && (
        <ChatWindow friendId={selectedFriend.id} friendUsername={selectedFriend.username} />
      )}
    </div>
  );
};

export default FriendList;
