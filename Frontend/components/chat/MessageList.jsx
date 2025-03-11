const MessageList = ({ messages }) => {
    return (
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} style={{ ...styles.message, justifyContent: msg.from === "bot" ? "flex-start" : "flex-end" }}>
            {msg.from === "bot" && <img src="/emiliaPersonaje2.jpeg" alt="Bot" style={styles.avatar} />}
            <div style={{ ...styles.messageText, background: msg.from === "bot" ? "#e0e0e0" : "#af7ac5", color: msg.from === "bot" ? "black" : "white" }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const styles = {
    messages: {
      display: "flex",
      flexDirection: "column",
      padding: "10px",
    },
    message: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    avatar: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    messageText: {
        padding: "10px",
        borderRadius: "10px",
        maxWidth: "50%",  // 👈 Evita que los mensajes ocupen más del 50% del ancho del chat
        wordWrap: "break-word", // 👈 Asegura que las palabras largas se dividan en varias líneas
        overflowWrap: "break-word", // 👈 Evita que el texto salga del contenedor
        whiteSpace: "pre-wrap", // 👈 Mantiene los espacios y saltos de línea
    },
  };
  
  export default MessageList;
  