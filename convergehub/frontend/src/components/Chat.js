// src/components/Chat.js
import React, { useState } from 'react';
import FriendList from './FriendList';

function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hello!', sender: 'User1' },
        { id: 2, text: 'Hi there!', sender: 'User2' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'You' }]);
            setNewMessage('');
        }
    };

    return (
        <div style={styles.container}>
            <FriendList />
            <div style={styles.messages}>
                {messages.map((msg) => (
                    <div key={msg.id} style={styles.message}>
                        <strong>{msg.sender}: </strong>{msg.text}
                    </div>
                ))}
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={styles.input}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend} style={styles.button}>
                    Send
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    messages: {
        flex: 1,
        overflowY: 'auto',
        marginBottom: '20px',
    },
    message: {
        marginBottom: '10px',
    },
    inputContainer: {
        display: 'flex',
    },
    input: {
        flex: 1,
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        marginLeft: '10px',
        cursor: 'pointer',
    },
};

export default Chat;