import { useState, useEffect, useRef } from "react";
import OpenAI from 'openai';
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { COMBINED_THERAPEUTIC_PROMPT } from "./prompts";
import config, { validateConfig } from "../../src/config";

const ChatComponent = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hola, soy EMILIA. ¿Cómo te sientes hoy? Estoy aquí para escucharte y ayudarte." },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef(null);
  const [savedConversations, setSavedConversations] = useState([]);
  const [showSavedConversations, setShowSavedConversations] = useState(false);
  
  // Referencia a la instancia de OpenAI para OpenRouter
  const openRouter = useRef(
    config.AI.PROVIDER === 'openrouter' 
      ? new OpenAI({
          baseURL: config.AI.OPENROUTER.BASE_URL,
          apiKey: config.AI.OPENROUTER.API_KEY,
          defaultHeaders: {
            'HTTP-Referer': config.AI.OPENROUTER.SITE_URL,
            'X-Title': config.AI.OPENROUTER.SITE_NAME,
          },
          dangerouslyAllowBrowser: true,
        })
      : null
  );
  
  // Validar la configuración al iniciar
  useEffect(() => {
    const isConfigValid = validateConfig();
    setConfigError(!isConfigValid);
    
    if (!isConfigValid) {
      console.error('❌ Error en la configuración. Verifica el archivo .env');
    } else if (config.APP.DEBUG_MODE) {
      console.log('✅ Configuración válida.');
      console.log(`🤖 Usando proveedor: ${config.AI.PROVIDER}`);
      console.log(`🧠 Usando modelo: ${config.AI.PROVIDER === 'openai' ? config.AI.MODEL : config.AI.OPENROUTER.MODEL}`);
    }
    
    // Cargar conversaciones guardadas
    loadSavedConversations();
  }, []);
  
  // Initialize LangChain chat model (solo para OpenAI)
  const chatModel = useRef(
    config.AI.PROVIDER === 'openai'
      ? new ChatOpenAI({
          modelName: config.AI.MODEL,
          temperature: config.AI.TEMPERATURE,
          openAIApiKey: config.AI.API_KEY,
        })
      : null
  );
  
  // Initialize memory to store chat history
  const memory = useRef(new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
  }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingIndicator]);
  
  // Cargar conversaciones guardadas desde localStorage
  const loadSavedConversations = () => {
    try {
      const savedConvs = localStorage.getItem('emilia_saved_conversations');
      if (savedConvs) {
        setSavedConversations(JSON.parse(savedConvs));
      }
    } catch (error) {
      console.error('Error al cargar conversaciones guardadas:', error);
    }
  };
  
  // Guardar la conversación actual
  const saveCurrentConversation = () => {
    try {
      if (messages.length <= 1) {
        // No guardar si solo está el mensaje de bienvenida
        return;
      }
      
      const date = new Date();
      const conversationTitle = `Conversación ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      
      const newSavedConversation = {
        id: Date.now(),
        title: conversationTitle,
        messages: [...messages],
        date: date.toISOString()
      };
      
      const updatedConversations = [...savedConversations, newSavedConversation];
      
      // Actualizar estado
      setSavedConversations(updatedConversations);
      
      // Guardar en localStorage
      localStorage.setItem('emilia_saved_conversations', JSON.stringify(updatedConversations));
      
      // Mostrar confirmación
      alert('Conversación guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la conversación:', error);
      alert('Error al guardar la conversación');
    }
  };
  
  // Cargar una conversación guardada
  const loadConversation = (conversationId) => {
    try {
      const conversation = savedConversations.find(conv => conv.id === conversationId);
      if (conversation) {
        // Cargar los mensajes
        setMessages([...conversation.messages]);
        
        // Actualizar la memoria con el último par de mensajes
        const lastUserMsg = conversation.messages.filter(msg => msg.from === 'user').pop();
        const lastBotMsg = conversation.messages.filter(msg => msg.from === 'bot').pop();
        
        if (lastUserMsg && lastBotMsg) {
          memory.current.saveContext(
            { input: lastUserMsg.text },
            { output: lastBotMsg.text }
          );
        }
        
        // Cerrar el selector de conversaciones
        setShowSavedConversations(false);
      }
    } catch (error) {
      console.error('Error al cargar la conversación:', error);
      alert('Error al cargar la conversación');
    }
  };
  
  // Eliminar una conversación guardada
  const deleteConversation = (conversationId, event) => {
    event.stopPropagation();
    try {
      const updatedConversations = savedConversations.filter(conv => conv.id !== conversationId);
      setSavedConversations(updatedConversations);
      localStorage.setItem('emilia_saved_conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error al eliminar la conversación:', error);
      alert('Error al eliminar la conversación');
    }
  };
  
  // Iniciar una nueva conversación
  const startNewConversation = () => {
    try {
      // Primero actualizar los mensajes
      setMessages([
        { from: "bot", text: "Hola, soy EMILIA. ¿Cómo te sientes hoy? Estoy aquí para escucharte y ayudarte." },
      ]);
      
      // Luego recrear la memoria con un pequeño retraso para evitar problemas de renderizado
      setTimeout(() => {
        try {
          memory.current = new BufferMemory({
            returnMessages: true,
            memoryKey: "chat_history",
          });
        } catch (error) {
          console.error("Error al reiniciar la memoria:", error);
        }
      }, 100);
      
      // Ocultar el panel de conversaciones
      setShowSavedConversations(false);
    } catch (error) {
      console.error("Error al iniciar nueva conversación:", error);
      alert("Hubo un problema al iniciar una nueva conversación. Intenta recargar la página.");
    }
  };
  
  // Función para simular un efecto de "está escribiendo..."
  const showTypingIndicator = async () => {
    setTypingIndicator(true);
    await new Promise(resolve => setTimeout(resolve, 700)); // Suficiente tiempo para que se vea la animación
  };
  
  const hideTypingIndicator = () => {
    setTypingIndicator(false);
  };
  
  // Función para procesar y añadir respuestas múltiples con retraso
  const addBotMessagesWithDelay = async (responseText, userMessage) => {
    // Dividir la respuesta por el separador "---"
    const messageSegments = responseText.split(/\s*---\s*/);
    
    // Añadir cada segmento como un mensaje separado con retraso
    for (let i = 0; i < messageSegments.length; i++) {
      const segment = messageSegments[i].trim();
      if (segment) {
        // Si no es el primer mensaje, añadir un retraso adaptativo
        if (i > 0) {
          // Calcular retraso basado en la longitud del mensaje anterior
          // Mensajes cortos = retraso corto, mensajes largos = retraso más largo
          const prevSegmentLength = messageSegments[i-1].length;
          // Retraso mínimo de 800ms, máximo de 2000ms
          const delay = Math.min(Math.max(800, prevSegmentLength * 3), 2000);
          
          // Para desarrollo, podemos usar un retraso más corto para pruebas
          const finalDelay = config.APP.DEBUG_MODE ? Math.min(delay, 1000) : delay;
          
          // Mostrar indicador de escritura
          await showTypingIndicator();
          await new Promise(resolve => setTimeout(resolve, finalDelay));
          hideTypingIndicator();
        }
        
        setMessages(prev => [...prev, { from: "bot", text: segment }]);
        
        // Actualizar el contexto de memoria solo con el último mensaje para evitar duplicación
        if (i === messageSegments.length - 1) {
          await memory.current.saveContext(
            { input: userMessage },
            { output: responseText } // Guardar respuesta completa en la memoria
          );
        }
        
        // Scroll al fondo después de añadir cada mensaje
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Add user message to the state
    setMessages((prev) => [...prev, { from: "user", text: message }]);
    setIsLoading(true);
    
    // Muestra el indicador de escritura
    await showTypingIndicator();

    try {
      if (configError) {
        throw new Error("Error de configuración. Verifica el archivo .env");
      }
      
      let botResponseText = "";
      
      if (config.AI.PROVIDER === 'openai') {
        // Usar LangChain con OpenAI
        const langchainMessages = [
          new SystemMessage(COMBINED_THERAPEUTIC_PROMPT),
          ...formatMessagesForLangChain()
        ];
        
        langchainMessages.push(new HumanMessage(message));
        
        const response = await chatModel.current.call(langchainMessages);
        botResponseText = response.content;
        
      } else if (config.AI.PROVIDER === 'openrouter') {
        // Usar OpenRouter directamente
        const conversationHistory = formatMessagesForOpenRouter();
        
        // Añadir el prompt del sistema al principio
        if (conversationHistory.length === 0 || conversationHistory[0].role !== 'system') {
          conversationHistory.unshift({
            role: 'system',
            content: COMBINED_THERAPEUTIC_PROMPT
          });
        }
        
        // Añadir el mensaje del usuario
        conversationHistory.push({
          role: 'user',
          content: message
        });
        
        // Llamar a OpenRouter con el modelo Gemini
        const completion = await openRouter.current.chat.completions.create({
          model: config.AI.OPENROUTER.MODEL,
          messages: conversationHistory,
          temperature: config.AI.TEMPERATURE,
        });
        
        botResponseText = completion.choices[0].message.content;
      } else {
        throw new Error(`Proveedor desconocido: ${config.AI.PROVIDER}`);
      }
      
      // Oculta el indicador de escritura
      hideTypingIndicator();
      
      // Verificar si la respuesta contiene el separador "---"
      if (botResponseText.includes('---')) {
        // Procesar múltiples mensajes
        await addBotMessagesWithDelay(botResponseText, message);
      } else {
        // Añadir un solo mensaje como antes
        setMessages((prev) => [...prev, { from: "bot", text: botResponseText }]);
        
        // Actualizar la memoria
        await memory.current.saveContext(
          { input: message },
          { output: botResponseText }
        );
      }
      
    } catch (error) {
      console.error("Error getting response from AI:", error);
      hideTypingIndicator();
      
      let errorMessage = "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.";
      
      if (configError || error.message.includes('API key')) {
        errorMessage = "Error de configuración: Verifica que la API key y el modelo estén correctamente configurados en el archivo .env";
      }
      
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to format messages for LangChain
  const formatMessagesForLangChain = () => {
    // Skip the first message (bot greeting) and start from user messages
    return messages.slice(1).map(msg => {
      if (msg.from === "user") {
        return new HumanMessage(msg.text);
      } else {
        return new AIMessage(msg.text);
      }
    });
  };
  
  // Helper function to format messages for OpenRouter
  const formatMessagesForOpenRouter = () => {
    // Para la historia de la conversación, tratamos todos los mensajes como entidades independientes
    // No incluimos el mensaje del sistema aquí, lo añadiremos por separado
    
    // Crearemos un nuevo array con los mensajes formateados
    const formattedMessages = [];
    
    // Recorremos todos los mensajes en la conversación
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text
      });
    });
    
    return formattedMessages;
  };

  return (
    <div style={styles.chatContainer}>
      {/* ENCABEZADO DEL CHAT */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLogo}>
            <img src="/emiliaPersonaje2.jpeg" alt="EMILIA Logo" style={styles.logoImage} />
            <h2 style={styles.headerText}>EMILIA</h2>
          </div>
          <p style={styles.headerSubtext}>
            {configError 
              ? "⚠️ Error de configuración. Verifica el archivo .env" 
              : "Tu asistente terapéutico personal"}
          </p>
          
          {/* Botones de control de conversación */}
          <div style={styles.conversationControls}>
            <button 
              onClick={() => setShowSavedConversations(!showSavedConversations)} 
              style={styles.controlButton}
              title="Ver conversaciones guardadas"
            >
              {showSavedConversations ? "Cerrar" : "Mis conversaciones"}
            </button>
            <button 
              onClick={saveCurrentConversation} 
              style={styles.controlButton}
              title="Guardar esta conversación"
              disabled={messages.length <= 1}
            >
              Guardar
            </button>
            <button 
              onClick={startNewConversation} 
              style={styles.controlButton}
              title="Iniciar nueva conversación"
            >
              Nueva
            </button>
          </div>
        </div>
      </div>
      
      {/* Panel de conversaciones guardadas */}
      {showSavedConversations && (
        <div style={styles.savedConversationsPanel}>
          <h3 style={styles.savedConversationsTitle}>Conversaciones guardadas</h3>
          {savedConversations.length === 0 ? (
            <p style={styles.noConversations}>No tienes conversaciones guardadas.</p>
          ) : (
            <div style={styles.conversationsList}>
              {savedConversations.map(conv => (
                <div 
                  key={conv.id} 
                  style={styles.conversationItem}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div style={styles.conversationInfo}>
                    <span style={styles.conversationTitle}>{conv.title}</span>
                    <span style={styles.conversationDate}>
                      {new Date(conv.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    style={styles.deleteButton}
                    onClick={(e) => deleteConversation(conv.id, e)}
                    title="Eliminar conversación"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ÁREA DE MENSAJES */}
      <div style={styles.messageList}>
        <MessageList messages={messages} />
        
        {/* Indicador de escritura */}
        {typingIndicator && (
          <div style={styles.typingIndicatorContainer}>
            <div style={styles.typingAvatar}>
              <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" style={styles.typingAvatarImg} />
            </div>
            <div style={styles.typingBubble}>
              <div style={styles.typingDot}></div>
              <div style={styles.typingDot}></div>
              <div style={styles.typingDot}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        {isLoading && !typingIndicator && <div style={styles.loadingIndicator}>EMILIA está reflexionando...</div>}
      </div>

      {/* CAJA DE MENSAJE */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        isDisabled={isLoading || configError} 
        placeholder={configError 
          ? "Configuración incompleta. Contacta al administrador."
          : "Comparte cómo te sientes hoy..."
        }
      />
    </div>
  );
};

// Crear estilos de animación al montar componente
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh", 
    width: "calc(100% - 20px)",
    borderRadius: "16px",
    background: "#f8f9fa",
    overflow: "hidden", 
    margin: "auto", 
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  header: {
    background: "linear-gradient(135deg, #7e57c2 0%, #9b59b6 100%)",
    color: "white",
    padding: "16px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    position: "relative",
    zIndex: 1,
  },
  headerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  headerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoImage: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },
  headerText: {
    margin: 0,
    color: "white",
    fontSize: "1.6rem",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  headerSubtext: {
    margin: "5px 0 0 0",
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.95rem",
    fontWeight: "normal",
  },
  conversationControls: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
  },
  controlButton: {
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    }
  },
  savedConversationsPanel: {
    background: "#fff",
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
    maxHeight: "200px",
    overflowY: "auto",
  },
  savedConversationsTitle: {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#333",
    margin: "0 0 10px 0",
  },
  noConversations: {
    fontSize: "0.9rem",
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  conversationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  conversationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#f1f1f1",
    cursor: "pointer",
    transition: "background 0.2s ease",
    "&:hover": {
      background: "#e0e0e0",
    },
  },
  conversationInfo: {
    display: "flex",
    flexDirection: "column",
  },
  conversationTitle: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#333",
  },
  conversationDate: {
    fontSize: "0.75rem",
    color: "#666",
  },
  deleteButton: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.1)",
    color: "#666",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(0,0,0,0.2)",
      color: "#333",
    },
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "16px",
    maxHeight: "calc(100vh - 190px)",
    backgroundColor: "#f8f9fa",
    backgroundImage: "radial-gradient(circle at center, rgba(155, 89, 182, 0.03) 0%, rgba(229, 229, 229, 0.01) 70%)",
  },
  loadingIndicator: {
    padding: "16px",
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
    fontSize: "0.9rem",
    opacity: 0.8,
    animation: "pulse 2s infinite ease-in-out",
  },
  typingIndicatorContainer: {
    display: "flex",
    alignItems: "flex-start",
    margin: "8px 0",
    paddingLeft: "8px",
  },
  typingAvatar: {
    width: "36px",
    height: "36px",
    marginRight: "8px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
  },
  typingAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  typingBubble: {
    display: "flex",
    alignItems: "center",
    background: "#e8f4f8",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "60px",
    height: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#666",
    borderRadius: "50%",
    margin: "0 2px",
    opacity: 0.6,
    animation: "bounce 1.4s infinite ease-in-out both",
    animationDelay: "calc(var(--i) * 0.2s)",
  },
  "@media (max-width: 768px)": {
    chatContainer: {
      width: "100%", 
      height: "100vh", 
      borderRadius: "0",
      margin: 0,
      border: "none",
    },
    header: {
      padding: "12px",
    },
    headerText: {
      fontSize: "1.4rem",
    },
    savedConversationsPanel: {
      maxHeight: "150px",
    },
  },
  "@media (max-width: 1024px)": {
    chatContainer: {
      width: "calc(100% - 10px)",
    },
  },
};

// Añadir animación a los puntos del indicador de escritura
for (let i = 0; i < 3; i++) {
  if (styles.typingDot) {
    styles.typingDot[`&:nth-child(${i+1})`] = {
      animationDelay: `${i * 0.2}s`
    };
  }
}

export default ChatComponent;
