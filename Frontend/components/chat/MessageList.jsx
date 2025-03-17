import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// Simple YouTube play icon component
const PlayIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    fill="#9b59b6" 
    style={{ marginRight: '6px', flexShrink: 0 }}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
  </svg>
);

// Function to extract YouTube video ID from URL
const extractVideoId = (url) => {
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  
  return videoId;
};

const MessageList = ({ messages }) => {
    // Estado para controlar las animaciones de los mensajes
    const [visibleMessages, setVisibleMessages] = useState([]);
    const [expandedVideos, setExpandedVideos] = useState({});
    
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
    
    // Auto-expand new videos when detected
    useEffect(() => {
      // Check last message for YouTube links
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.from === 'bot') {
        const youtubeUrlPattern = /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/(?:www\.)?youtu\.be\/[\w-]+)/g;
        let match;
        while ((match = youtubeUrlPattern.exec(lastMessage.text)) !== null) {
          const url = match[0];
          const videoId = extractVideoId(url);
          if (videoId) {
            setExpandedVideos(prev => ({
              ...prev,
              [videoId]: true // Auto-expand this video
            }));
          }
        }
      }
    }, [messages]);
    
    // Función para formatear la hora actual
    const formatMessageTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    const toggleVideoExpand = (videoId) => {
      setExpandedVideos(prev => ({
        ...prev,
        [videoId]: !prev[videoId]
      }));
    };
    
    // Parse message text to render video links as styled components
    const renderMessageContent = (text) => {
      // Check for YouTube links with any surrounding format
      // This broader pattern will catch various formats including "[Category: Title](url)"
      const youtubeUrlPattern = /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/(?:www\.)?youtu\.be\/[\w-]+)/g;
      
      // First, check if there's any YouTube link at all
      if (!youtubeUrlPattern.test(text)) {
        return text; // No YouTube links found
      }
      
      // For more specific formatting, try to extract category and title if available
      // Look for patterns like [Category: Title](url) or similar
      const formattedLinkRegex = /\[(.*?)(?::|：)\s*(.*?)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)\)/g;
      
      // If no formatted links found, just make the URLs clickable
      if (!formattedLinkRegex.test(text)) {
        // Reset the pattern index
        youtubeUrlPattern.lastIndex = 0;
        
        let parts = [];
        let lastIndex = 0;
        let match;
        
        // Make all YouTube URLs clickable with a simple style
        while ((match = youtubeUrlPattern.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          
          const url = match[0];
          const videoId = extractVideoId(url);
          const isExpanded = expandedVideos[videoId] !== false; // Default to expanded
          
          parts.push(
            <div key={url} style={styles.videoCard}>
              {isExpanded && (
                <div style={styles.videoEmbedContainer}>
                  <iframe 
                    width="100%" 
                    height="280" 
                    src={`https://www.youtube.com/embed/${videoId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={styles.videoEmbed}
                  ></iframe>
                </div>
              )}
              
              <div 
                style={styles.videoLinkContainer}
                onClick={() => toggleVideoExpand(videoId)}
              >
                <div style={styles.videoCategory}>
                  <PlayIcon /> Video de YouTube
                </div>
                <div style={styles.videoTitle}>
                  {isExpanded ? "Ocultar" : "Ver video"}
                </div>
              </div>
            </div>
          );
          
          lastIndex = match.index + url.length;
        }
        
        // Add the remaining text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
        
        return parts;
      }
      
      // Reset regex lastIndex
      formattedLinkRegex.lastIndex = 0;
      
      let parts = [];
      let lastIndex = 0;
      let match;
      
      // Process nicely formatted links with category and title
      while ((match = formattedLinkRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        
        // Extract category, title and URL
        const [fullMatch, category, title, url] = match;
        const videoId = extractVideoId(url);
        const isExpanded = expandedVideos[videoId] !== false; // Default to expanded
        
        parts.push(
          <div key={url} style={styles.videoCard}>
            {isExpanded && (
              <div style={styles.videoEmbedContainer}>
                <iframe 
                  width="100%" 
                  height="280" 
                  src={`https://www.youtube.com/embed/${videoId}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={styles.videoEmbed}
                ></iframe>
              </div>
            )}
            
            <div 
              style={styles.videoLinkContainer}
              onClick={() => toggleVideoExpand(videoId)}
            >
              <div style={styles.videoCategory}>
                <PlayIcon /> {category}
              </div>
              <div style={styles.videoTitle}>
                {title} {isExpanded ? "(Ocultar)" : "(Ver)"}
              </div>
            </div>
          </div>
        );
        
        lastIndex = match.index + fullMatch.length;
      }
      
      // Add the remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      return parts;
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
                    {renderMessageContent(msg.text)}
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
  videoCard: {
    width: "100%",
    margin: "8px 0 16px 0",
  },
  videoLinkContainer: {
    display: "flex",
    flexDirection: "column",
    margin: "0",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#f8f0fe",
    borderLeft: "4px solid #9b59b6",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    position: "relative",
    marginLeft: "0",
    marginRight: "0",
    cursor: "pointer",
    "&:hover": {
      background: "#f3e5fc",
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    },
    "&:after": {
      content: '"►"',
      position: "absolute",
      right: "10px",
      bottom: "10px",
      color: "#9b59b6",
      fontSize: "12px",
      opacity: "0.6",
    },
  },
  videoCategory: {
    fontSize: "13px",
    color: "#9b59b6",
    fontWeight: "600",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
  },
  videoTitle: {
    fontSize: "14.5px",
    color: "#444",
    fontWeight: "500",
    lineHeight: "1.3",
  },
  videoEmbedContainer: {
    width: "100%",
    marginBottom: "8px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  videoEmbed: {
    border: "none",
    display: "block",
    backgroundColor: "#000",
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
      
      /* Video link hover effects */
      a[href^="https://www.youtube.com"] div {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      a[href^="https://www.youtube.com"]:hover div {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  