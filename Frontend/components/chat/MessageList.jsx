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
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
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
                ...(msg.from === "user" ? styles.userMessage : {}),
                marginBottom: isLastInSequence ? "16px" : "4px",
                opacity: isNewMessage ? 0 : 1,
                animation: isNewMessage ? 'fadeIn 0.3s ease-in-out forwards' : 'none'
              }}
            >
              {/* Contenedor del avatar y mensaje */}
              <div style={styles.messageContainer}>
                {/* Avatar for bot */}
                {msg.from === "bot" && isFirstInSequence && (
                  <div style={styles.avatarWrapper}>
                    <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" style={styles.avatar} />
                  </div>
                )}
                {msg.from === "bot" && !isFirstInSequence && 
                  <div style={styles.avatarPlaceholder}></div>
                }
                
                {/* Message bubble */}
                <div style={{ 
                  ...styles.messageBubble,
                  ...(msg.from === "bot" ? styles.botBubble : styles.userBubble),
                  borderRadius: getBorderRadius(msg.from, isFirstInSequence, isLastInSequence),
                }}>
                  <div style={styles.messageText}>
                    {msg.text}
                  </div>
                  
                  {/* Timestamp */}
                  <div style={{
                    ...styles.timestamp,
                    color: msg.from === "bot" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)"
                  }}>
                    {formatMessageTime()}
                  </div>
                </div>
              </div>
              
              {/* User avatar/label */}
              {msg.from === "user" && isFirstInSequence && (
                <div style={styles.userBadge}>
                  <span>Tú</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
// Función para determinar el radio de borde según la posición en la secuencia
const getBorderRadius = (from, isFirst, isLast) => {
  if (from === "bot") {
    if (isFirst && isLast) return "18px 18px 18px 0"; 
    if (isFirst) return "18px 18px 6px 0"; 
    if (isLast) return "6px 18px 18px 0"; 
    return "6px 18px 6px 0"; 
  } else { // usuario
    if (isFirst && isLast) return "18px 0 18px 18px"; 
    if (isFirst) return "18px 0 6px 18px"; 
    if (isLast) return "6px 0 18px 18px"; 
    return "6px 0 6px 18px"; 
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
    padding: "0 16px",
  },
  message: {
    display: "flex",
    alignItems: "flex-end",
    position: "relative",
    marginBottom: "4px",
    maxWidth: "85%",
    paddingRight: "48px",
  },
  userMessage: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    paddingRight: "0",
    paddingLeft: "48px",
  },
  messageContainer: {
    display: "flex",
    alignItems: "flex-end",
    maxWidth: "100%",
  },
  avatarWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    marginRight: "8px",
    flexShrink: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "36px",
    marginRight: "8px",
    flexShrink: 0,
  },
  messageBubble: {
    position: "relative",
    padding: "10px 12px",
    maxWidth: "100%",
    wordBreak: "break-word",
  },
  botBubble: {
    background: "#f0f4f9",
    color: "#333",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  userBubble: {
    background: "#9b59b6",
    color: "#fff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  messageText: {
    fontSize: "15px",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap",
    textAlign: "left",
  },
  userBadge: {
    position: "absolute",
    right: "10px",
    bottom: "0",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "rgba(155, 89, 182, 0.1)",
    color: "#9b59b6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
    opacity: 0.8,
  },
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
      
      /* Add smooth scrolling to containers */
      div {
        scrollbar-width: thin;
        scrollbar-color: rgba(155, 89, 182, 0.2) transparent;
      }
      
      div::-webkit-scrollbar {
        width: 4px;
      }
      
      div::-webkit-scrollbar-track {
        background: transparent;
      }
      
      div::-webkit-scrollbar-thumb {
        background-color: rgba(155, 89, 182, 0.2);
        border-radius: 4px;
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
  