import { useState } from "react";
import { FiSend } from "react-icons/fi";
import PropTypes from 'prop-types';

const MessageInput = ({ 
  onSendMessage, 
  isDisabled = false,
  placeholder = "Comparte cómo te sientes hoy..."
}) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim() && !isDisabled) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.messageInput}>
        <textarea
          placeholder={placeholder}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          style={{...styles.input, ...(isDisabled ? styles.inputDisabled : {})}}
          disabled={isDisabled}
          rows={1}
        />
        <button 
          onClick={handleSend} 
          style={{...styles.button, ...(isDisabled || !inputMessage.trim() ? styles.buttonDisabled : {})}}
          disabled={isDisabled || !inputMessage.trim()}
          title="Enviar mensaje"
        >
          <FiSend size={18} />
        </button>
      </div>
      <div style={styles.disclaimer}>
        EMILIA es un asistente de apoyo emocional con IA y no reemplaza la atención de un profesional de salud mental.
      </div>
    </div>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  placeholder: PropTypes.string
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 16px 16px",
    background: "#fff",
    borderTop: "1px solid #eee",
  },
  messageInput: {
    display: "flex",
    alignItems: "center",
    background: "#f8f8f8",
    borderRadius: "30px",
    padding: "5px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  input: {
    flex: 1,
    padding: "12px 15px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    borderRadius: "30px",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: "1.4",
    color: "#333",
    background: "transparent",
    maxHeight: "80px",
    overflowY: "auto",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  button: {
    background: "#9b59b6",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "4px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(155, 89, 182, 0.2)",
  },
  buttonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  disclaimer: {
    fontSize: "11px",
    color: "#999",
    textAlign: "center",
    marginTop: "10px",
    fontStyle: "italic",
  },
};

export default MessageInput;

