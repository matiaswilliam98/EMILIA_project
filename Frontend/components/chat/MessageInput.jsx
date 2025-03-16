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
          style={{...styles.button, ...(isDisabled ? styles.buttonDisabled : {})}}
          disabled={isDisabled}
          title="Enviar mensaje"
        >
          <FiSend />
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
    padding: "10px",
    background: "white",
    borderTop: "1px solid #ddd",
  },
  messageInput: {
    display: "flex",
    background: "white",
    borderRadius: "20px",
    border: "1px solid #ddd",
    padding: "4px",
  },
  input: {
    flex: 1,
    padding: "12px 15px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    borderRadius: "20px",
    resize: "none",
    fontFamily: "inherit",
    lineHeight: "1.4",
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
    marginLeft: "8px",
    alignSelf: "center",
    transition: "background 0.2s ease",
  },
  buttonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  disclaimer: {
    fontSize: "11px",
    color: "#888",
    textAlign: "center",
    marginTop: "8px",
    fontStyle: "italic",
  },
};

export default MessageInput;

