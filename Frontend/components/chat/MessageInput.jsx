import { useState } from "react";
import { FiSend } from "react-icons/fi";

const MessageInput = ({ onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div style={styles.messageInput}>
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        style={styles.input}
      />
      <button onClick={handleSend} style={styles.button}>
        <FiSend />
      </button>
    </div>
  );
};

const styles = {
  messageInput: {
    display: "flex",
    padding: "10px",
    background: "white",
    borderTop: "1px solid #ddd",
    borderRadius: "20px", 
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
    fontSize: "16px",
  },
  button: {
    background: "#9b59b6",
    color: "white",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default MessageInput;

