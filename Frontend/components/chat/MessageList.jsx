import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const MessageList = ({ messages }) => {
    // Estado para controlar las animaciones de los mensajes
    const [visibleMessages, setVisibleMessages] = useState([]);
    
    // Efecto para animar la entrada de nuevos mensajes
    useEffect(() => {
      if (messages.length > visibleMessages.length) {
        // Añadir cada mensaje nuevo con un pequeño retraso para la animación
        const timer = setTimeout(() => {
          setVisibleMessages(messages);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setVisibleMessages(messages);
      }
    }, [messages]);
    
    // Función para formatear la hora actual
    const formatMessageTime = () => {
      const now = new Date();
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    };
    
    return (
      <div style={styles.messages}>
        {visibleMessages.map((msg, index) => {
          // Determinar si este mensaje es parte de una secuencia del mismo remitente
          const isFirstInSequence = index === 0 || messages[index - 1].from !== msg.from;
          const isLastInSequence = index === messages.length - 1 || messages[index + 1].from !== msg.from;
          
          // Determinar si el mensaje es "nuevo" para animación
          const isNewMessage = index === visibleMessages.length - 1 && 
                               visibleMessages.length === messages.length;
          
          return (
            <div 
              key={index} 
              className={isNewMessage ? 'fade-in-message' : ''}
              style={{ 
                ...styles.message, 
                justifyContent: msg.from === "bot" ? "flex-start" : "flex-end",
                marginBottom: isLastInSequence ? "15px" : "4px",
                opacity: isNewMessage ? 0 : 1,
                animation: isNewMessage ? 'fadeIn 0.3s ease-in-out forwards' : 'none'
              }}
            >
              {/* Contenedor del avatar y mensaje */}
              <div style={styles.messageContainer}>
                {/* Avatar section */}
                <div style={styles.avatarContainer}>
                  {msg.from === "bot" && isFirstInSequence && (
                    <div style={styles.avatarWrapper}>
                      <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" style={styles.avatar} />
                    </div>
                  )}
                  {msg.from === "bot" && !isFirstInSequence && 
                    <div style={styles.avatarPlaceholder}></div>
                  }
                </div>
                
                {/* Message bubble */}
                <div style={{ 
                  ...styles.messageBubble,
                  background: msg.from === "bot" 
                    ? "linear-gradient(135deg, #e8f4f8 0%, #e0f2f1 100%)" 
                    : "linear-gradient(135deg, #af7ac5 0%, #9b59b6 100%)",
                  color: msg.from === "bot" ? "#333333" : "white",
                  borderRadius: getBorderRadius(msg.from, isFirstInSequence, isLastInSequence),
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transform: `scale(${isNewMessage ? 0.95 : 1})`,
                  transition: 'all 0.2s ease-out',
                }}>
                  <div style={{
                    ...styles.messageText,
                    textAlign: msg.from === "bot" ? "left" : "right"
                  }}>
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <div style={{
                    ...styles.timestamp,
                    color: msg.from === "bot" ? "#99aab5" : "rgba(255,255,255,0.7)"
                  }}>
                    {formatMessageTime()}
                  </div>
                </div>
              </div>
              
              {/* User label */}
              {msg.from === "user" && isFirstInSequence && 
                <div style={styles.userAvatar}>Tú</div>
              }
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
    if (isFirst && isLast) return "18px 18px 18px 4px"; // Único mensaje
    if (isFirst) return "18px 18px 8px 4px"; // Primer mensaje
    if (isLast) return "8px 18px 18px 4px"; // Último mensaje
    return "8px 18px 8px 4px"; // Mensaje intermedio
  } else { // usuario
    if (isFirst && isLast) return "18px 4px 18px 18px"; // Único mensaje
    if (isFirst) return "18px 4px 8px 18px"; // Primer mensaje
    if (isLast) return "8px 4px 18px 18px"; // Último mensaje
    return "8px 4px 8px 18px"; // Mensaje intermedio
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
    transition: "opacity 0.3s ease-in-out",
  },
  messageContainer: {
    display: "flex",
    maxWidth: "75%",
  },
  avatarContainer: {
    width: "40px",
    marginRight: "8px",
    display: "flex",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    borderRadius: "50%",
    padding: "2px",
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid #e0e0e0",
  },
  avatarPlaceholder: {
    width: "40px",
  },
  messageBubble: {
    position: "relative",
    padding: "12px 16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    maxWidth: "100%",
  },
  messageText: {
    wordWrap: "break-word",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
    fontSize: "15px",
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
  timestamp: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
    opacity: 0.7,
  },
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
};

// Añadir los estilos CSS para animaciones
const createStyles = () => {
  if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .fade-in-message {
        animation: fadeIn 0.3s ease-in-out forwards;
      }
    `;
    document.head.appendChild(styleEl);
  }
};

// Crear estilos de animación al montar componente
if (typeof window !== 'undefined') {
  createStyles();
}
  
export default MessageList;
  