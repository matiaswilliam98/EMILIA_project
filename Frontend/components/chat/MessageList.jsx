import PropTypes from 'prop-types';

const MessageList = ({ messages }) => {
    return (
      <div style={styles.messages}>
        {messages.map((msg, index) => {
          // Determinar si este mensaje es parte de una secuencia del mismo remitente
          const isFirstInSequence = index === 0 || messages[index - 1].from !== msg.from;
          const isLastInSequence = index === messages.length - 1 || messages[index + 1].from !== msg.from;
          
          return (
            <div 
              key={index} 
              style={{ 
                ...styles.message, 
                justifyContent: msg.from === "bot" ? "flex-start" : "flex-end",
                marginBottom: isLastInSequence ? "15px" : "4px"
              }}
            >
              {/* Solo mostrar avatar en el primer mensaje de una secuencia */}
              {msg.from === "bot" && isFirstInSequence && 
                <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" style={styles.avatar} />
              }
              {/* Espacio reservado para mantener alineación cuando no hay avatar */}
              {msg.from === "bot" && !isFirstInSequence && 
                <div style={styles.avatarPlaceholder}></div>
              }
              
              <div style={{ 
                ...styles.messageText, 
                background: msg.from === "bot" ? "#e8f4f8" : "#af7ac5", 
                color: msg.from === "bot" ? "#333333" : "white",
                borderRadius: getBorderRadius(msg.from, isFirstInSequence, isLastInSequence),
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>
                {msg.text}
              </div>
              
              {/* Solo mostrar etiqueta de usuario en el primer mensaje de una secuencia */}
              {msg.from === "user" && isFirstInSequence && 
                <div style={styles.userAvatar}>Tú</div>
              }
              {/* Espacio reservado para mantener alineación cuando no hay etiqueta */}
              {msg.from === "user" && !isFirstInSequence && 
                <div style={styles.userAvatarPlaceholder}></div>
              }
            </div>
          );
        })}
      </div>
    );
  };
  
// Función para determinar el radio de borde según la posición en la secuencia
const getBorderRadius = (from, isFirst, isLast) => {
  if (from === "bot") {
    if (isFirst && isLast) return "2px 18px 18px 18px"; // Único mensaje
    if (isFirst) return "2px 18px 18px 2px"; // Primer mensaje
    if (isLast) return "18px 18px 18px 2px"; // Último mensaje
    return "18px 18px 18px 2px"; // Mensaje intermedio
  } else { // usuario
    if (isFirst && isLast) return "18px 2px 18px 18px"; // Único mensaje
    if (isFirst) return "18px 2px 2px 18px"; // Primer mensaje
    if (isLast) return "18px 2px 18px 18px"; // Último mensaje
    return "18px 2px 2px 18px"; // Mensaje intermedio
  }
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
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    marginRight: "10px",
    border: "2px solid #e0e0e0",
  },
  avatarPlaceholder: {
    width: "35px",
    marginRight: "10px",
  },
  userAvatar: {
    fontSize: "12px",
    color: "#666",
    marginLeft: "8px",
    alignSelf: "center",
    fontStyle: "italic",
  },
  userAvatarPlaceholder: {
    width: "20px",
    marginLeft: "8px",
  },
  messageText: {
    padding: "12px 16px",
    maxWidth: "65%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
    fontSize: "15px",
  },
};
  
export default MessageList;
  