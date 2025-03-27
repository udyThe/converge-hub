import React, { useState, useEffect, useRef } from "react";
import { db, auth, storage } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  serverTimestamp, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const ChatWindow = ({ friendId, friendUsername }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get or create chat ID between current user and friend
  useEffect(() => {
    const getOrCreateChat = async () => {
      if (!currentUser || !friendId) return;
  
      // Generate a consistent chat ID by sorting user IDs
      const sortedIds = [currentUser.uid, friendId].sort();
      const generatedChatId = `${sortedIds[0]}_${sortedIds[1]}`;
      setChatId(generatedChatId);
  
      // Check if chat exists, if not create it
      const chatRef = doc(db, "chats", generatedChatId);
      // console.log("chatRef:", chatRef);
      
      try {
        const chatSnap = await getDoc(chatRef); // Use getDoc instead of getDocs for document reference
        // console.log("chatSnap:", chatSnap);
        
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: {
              [currentUser.uid]: true,
              [friendId]: true
            },
            createdAt: serverTimestamp(),
            lastMessage: "",
            lastMessageTime: serverTimestamp()
          });console.log("chat created");
          
        }
  
        // Subscribe to messages in this chat
        const messagesRef = collection(db, "chats", generatedChatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
  
        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messagesData);
        });
  
        return () => unsubscribeMessages();
      } catch (error) {
        console.error("Error in chat initialization:", error);
      }
    };
  
    getOrCreateChat();
  }, [currentUser, friendId]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    try {
      let fileUrl = null;
      let fileType = null;

      if (file) {
        setIsUploading(true);
        const storageRef = ref(storage, `chat_files/${chatId}/${file.name}_${Date.now()}`);
        const uploadTask = uploadBytes(storageRef, file);
        
        await uploadTask;
        fileUrl = await getDownloadURL(storageRef);
        fileType = file.type.split('/')[0]; // 'image', 'video', 'application', etc.
        setIsUploading(false);
        setFile(null);
      }

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileName: file ? file.name : null
      });

      // Update last message in chat
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: newMessage || (file ? "Sent a file" : ""),
        lastMessageTime: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{friendUsername}</h3>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">Start your conversation with {friendUsername}</div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.senderId === currentUser?.uid ? 'sent' : 'received'}`}
            >
              {message.fileUrl && (
                <div className="file-message">
                  {message.fileType === 'image' ? (
                    <img src={message.fileUrl} alt="Shared content" className="file-preview" />
                  ) : message.fileType === 'video' ? (
                    <video controls className="file-preview">
                      <source src={message.fileUrl} type={message.fileType} />
                    </video>
                  ) : (
                    <a 
                      href={message.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-download"
                    >
                      📄 {message.fileName || 'Download file'}
                    </a>
                  )}
                </div>
              )}
              {message.text && <div className="message-text">{message.text}</div>}
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <div className="file-input-container">
          <label htmlFor="file-upload" className="file-upload-button">
            📎
          </label>
          <input 
            id="file-upload" 
            type="file" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          {file && (
            <div className="file-info">
              {file.name}
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="remove-file-button"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-text-input"
        />
        <button 
          type="submit" 
          disabled={isUploading || (!newMessage.trim() && !file)}
          className="send-button"
        >
          {isUploading ? 'Uploading...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

// Styles (in the same file)
const styles = `
  .chat-window {
    display: flex;
    flex-direction: column;
    height: 500px;
    width: 400px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: white;
  }

  .chat-header {
    padding: 15px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
    font-weight: bold;
    text-align: center;
  }

  .messages-container {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background-color: #fafafa;
  }

  .no-messages {
    text-align: center;
    color: #999;
    margin-top: 50%;
  }

  .message {
    max-width: 70%;
    margin-bottom: 15px;
    padding: 10px 15px;
    border-radius: 18px;
    position: relative;
    word-wrap: break-word;
  }

  .sent {
    background-color: #007bff;
    color: white;
    margin-left: auto;
    border-bottom-right-radius: 4px;
  }

  .received {
    background-color: #e9ecef;
    color: black;
    margin-right: auto;
    border-bottom-left-radius: 4px;
  }

  .message-text {
    margin-bottom: 5px;
  }

  .message-time {
    font-size: 0.7em;
    opacity: 0.8;
    text-align: right;
  }

  .message-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
    background-color: #f5f5f5;
    align-items: center;
  }

  .message-text-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    margin: 0 10px;
  }

  .send-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
  }

  .send-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .file-input-container {
    display: flex;
    align-items: center;
  }

  .file-upload-button {
    cursor: pointer;
    font-size: 1.2em;
    padding: 5px 10px;
  }

  .file-info {
    margin-left: 10px;
    font-size: 0.8em;
    display: flex;
    align-items: center;
  }

  .remove-file-button {
    margin-left: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: #ff4444;
  }

  .file-message {
    margin-bottom: 10px;
  }

  .file-preview {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
  }

  .file-download {
    color: #007bff;
    text-decoration: none;
    display: flex;
    align-items: center;
  }
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);

export default ChatWindow;