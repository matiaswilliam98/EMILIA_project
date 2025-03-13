import PropTypes from 'prop-types';

const MessageList = ({ messages }) => {
    return (
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            ...styles.message, 
            justifyContent: msg.from === "bot" ? "flex-start" : "flex-end",
            marginBottom: "15px" 
          }}>
            {msg.from === "bot" && <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" style={styles.avatar} />}
            <div style={{ 
              ...styles.messageText, 
              background: msg.from === "bot" ? "#e8f4f8" : "#af7ac5", 
              color: msg.from === "bot" ? "#333333" : "white",
              borderRadius: msg.from === "bot" ? "2px 18px 18px 18px" : "18px 2px 18px 18px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
              {msg.text}
            </div>
            {msg.from === "user" && <div style={styles.userAvatar}>Tú</div>}
          </div>
        ))}
      </div>
    );
  };
  
MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      from: PropTypes.oneOf(['bot', 'user']).isRequired,
      text: PropTypes.string.isRequired
    })
  ).isRequired
};
  
const styles = {
  messages: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
  },
  message: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "15px",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    marginRight: "10px",
    border: "2px solid #e0e0e0",
  },
  userAvatar: {
    fontSize: "12px",
    color: "#666",
    marginLeft: "8px",
    alignSelf: "center",
    fontStyle: "italic",
  },
  messageText: {
    padding: "12px 16px",
    borderRadius: "18px",
    maxWidth: "65%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
    fontSize: "15px",
  },
};
  
export default MessageList;
  