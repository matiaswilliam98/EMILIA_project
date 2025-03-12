import { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const respuestasBot = {
    "hola": "Hola, ¿cómo estás?",
    "bien y tu": "¡Me alegra saberlo! Cuéntame sobre ti.",
    "cuéntame sobre ti": "Soy un chatbot diseñado para ayudarte. ¿En qué necesitas ayuda?",
    "gracias": "¡De nada! Estoy aquí para ayudarte. 😊",
    "adiós": "¡Hasta luego! Espero volver a hablar contigo pronto. 👋"
  };
  
  const ChatComponent = () => {
    const [messages, setMessages] = useState([
      { from: "bot", text: "Hola, ¿en qué puedo ayudarte?" },
    ]);
    const messagesEndRef = useRef(null);
  
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  
    const handleSendMessage = (message) => {
      if (!message.trim()) return;
      if (message.length > 200) return;
  
      setMessages((prev) => [...prev, { from: "user", text: message }]);
  
      setTimeout(() => {
        const botResponse = respuestasBot[message.toLowerCase()] || "No entendí eso, ¿puedes reformularlo?";
        setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
      }, 1000);
    };

  return (
    <div style={styles.chatContainer}>
      {/* ENCABEZADO DEL CHAT */}
      <div style={styles.header}>
        <h2 style={styles.headerText}></h2>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div style={styles.messageList}>
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* CAJA DE MENSAJE */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "90vh", 
    width: "calc(200vw - 280x)",
    borderRadius: "10px",
    background: "#f3f3fc",
    overflow: "hidden", 
    margin: "auto", 
    marginRight: "4vw",
    marginLeft: "-2vw",
  },
  header: {
    background: "#f3f3fc",
    color: "white",
    padding: "10px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  headerText: {
    margin: 0,
    color: "black",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "10px",
    maxHeight: "calc(100vh - 120px)",
  },
  "@media (max-width: 768px)": {
    chatContainer: {
      width: "95vw", 
      maxWidth: "100%", 
      height: "85vh", 
    },
  },
  "@media (max-width: 1024px)": {
    chatContainer: {
      width: "calc(100vw - 90px)", 
      maxWidth: "95vw",
    },
  },
};

export default ChatComponent;
