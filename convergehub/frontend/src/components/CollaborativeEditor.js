import React, { useState, useEffect, useRef } from "react";

function CollaborativeEditor() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const newSocket = new WebSocket(process.env.REACT_APP_WS_URL);
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "init") {
          setDocument(message.content);
        } else if (message.type === "operation") {
          applyOperation(message.operation);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => newSocket.close();
  }, []);

  const applyOperation = (operation) => {
    const { type, index, value } = operation;
    setDocument((prev) => {
      if (type === "insert") {
        return prev.slice(0, index) + value + prev.slice(index);
      }
      if (type === "delete") {
        return prev.slice(0, index) + prev.slice(index + value.length);
      }
      return prev;
    });
  };

  const handleChange = (e) => {
    const newDocument = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const diff = newDocument.length - document.length;

    let operation = null;
    if (diff > 0) {
      operation = {
        type: "insert",
        index: cursorPosition - diff,
        value: newDocument.slice(cursorPosition - diff, cursorPosition),
      };
    } else if (diff < 0) {
      operation = {
        type: "delete",
        index: cursorPosition,
        value: document.slice(cursorPosition, cursorPosition - diff),
      };
    }

    if (operation && socket) {
      socket.send(JSON.stringify({ type: "operation", operation }));
    }

    setDocument(newDocument);
  };

  return (
    <div className="flex flex-col items-center p-6 w-full">
      <h1 className="text-2xl font-semibold mb-4 text-white">Collaborative Editor</h1>
      <textarea
        ref={textareaRef}
        value={document}
        onChange={handleChange}
        rows="20"
        cols="80"
        className="w-4/5 h-[400px] text-base p-3 border border-gray-300 rounded-md bg-gray-100 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      />
    </div>
  );
}

export default CollaborativeEditor;
