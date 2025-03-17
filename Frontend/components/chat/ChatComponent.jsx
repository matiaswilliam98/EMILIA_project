import { useState, useEffect, useRef } from "react";
import OpenAI from 'openai';
import axios from "axios";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { BufferMemory } from "langchain/memory";
import { COMBINED_THERAPEUTIC_PROMPT } from "./prompts";
import config, { validateConfig } from "../../src/config";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const [userData, setUserData] = useState(null);
  
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
  
  // Validar la configuración y cargar datos del usuario al iniciar
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
    
    // Cargar datos del usuario
    fetchUserData();
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

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Usuario no autenticado');
        return;
      }
      
      const response = await axios.get(`${API_URL}/survey/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserData(response.data);
      
      // Si es la primera interacción y tenemos un nombre, personalizar el saludo
      if (messages.length === 1 && response.data.survey?.name) {
        setMessages([
          { from: "bot", text: `Hola ${response.data.survey.name}, soy EMILIA. ¿Cómo te sientes hoy? Estoy aquí para escucharte y ayudarte.` },
        ]);
      }
      
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
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
      
      // Crear un prompt personalizado con la información del usuario
      let personalizedPrompt = COMBINED_THERAPEUTIC_PROMPT;
      
      // Si tenemos datos del usuario, personalizar el prompt
      if (userData?.survey) {
        const survey = userData.survey;
        
        // Crear una sección de información del usuario para el prompt
        let userInfoSection = `
INFORMACIÓN DEL USUARIO:
- Nombre: ${survey.name || 'No disponible'}
- Género: ${survey.gender || 'No disponible'}
- Edad: ${survey.age || 'No disponible'}
- Personalidad: ${survey.personalityType || 'No disponible'}
`;

        // Verificar si tenemos los nuevos datos de bienestar del usuario
        if (survey.wellbeingResponses) {
          const wellbeing = survey.wellbeingResponses;
          userInfoSection += `
RESULTADOS DE BIENESTAR:
- Nivel de alegría: ${wellbeing.cheerful || 'No disponible'}
- Nivel de calma: ${wellbeing.calm || 'No disponible'}
- Nivel de energía: ${wellbeing.active || 'No disponible'}
- Calidad de descanso: ${wellbeing.rested || 'No disponible'}
- Interés en actividades: ${wellbeing.interesting || 'No disponible'}
- Nivel de depresión: ${wellbeing.depressed || 'No disponible'}
- Nivel de ansiedad: ${wellbeing.anxious || 'No disponible'}
- Sentimientos de desesperanza: ${wellbeing.hopeless || 'No disponible'}
- Sentimientos de paz: ${wellbeing.peaceful || 'No disponible'}
- Nivel de felicidad: ${wellbeing.happy || 'No disponible'}
`;
        }

        // Añadir resultados de diagnóstico si están disponibles
        if (survey.diagnosticResults) {
          const diagnostic = survey.diagnosticResults;
          userInfoSection += `
RESULTADOS DIAGNÓSTICOS:
- Índice de Bienestar WHO-5: ${diagnostic.who5Score || 'No disponible'}% - ${diagnostic.who5Result || 'No disponible'}
- Índice de Salud Mental MHI-5: ${diagnostic.mhi5Score ? Math.round(diagnostic.mhi5Score) : 'No disponible'}% - ${diagnostic.mhi5Result || 'No disponible'}
`;
        }
        
        userInfoSection += `
Adapta tus respuestas considerando esta información del usuario. Cuando te dirijas al usuario, utiliza su nombre (${survey.name || 'Usuario'}) para personalizar la conversación. Relaciona tus consejos con su perfil psicológico y resultados de bienestar.`;
        
        // Insertar esta información al principio del prompt
        personalizedPrompt = personalizedPrompt.replace("You are EMILIA", `You are EMILIA\n\n${userInfoSection}\n`);
      }
      
      if (config.AI.PROVIDER === 'openai') {
        // Usar LangChain con OpenAI
        const langchainMessages = [
          new SystemMessage(personalizedPrompt),
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
            content: personalizedPrompt
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
              Mis conversaciones
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
      <div style={styles.messageList} className="chat-scroll">
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
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Add enhanced chat scrollbar */
    .chat-scroll::-webkit-scrollbar {
      width: 6px;
    }
    
    .chat-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .chat-scroll::-webkit-scrollbar-thumb {
      background-color: rgba(155, 89, 182, 0.3);
      border-radius: 6px;
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh", 
    width: "100%",
    background: "#ffffff",
    overflow: "hidden", 
    margin: "0", 
    border: "none",
  },
  header: {
    background: "#9b59b6",
    color: "white",
    padding: "16px 20px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 2,
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
    marginBottom: "4px",
  },
  logoImage: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    objectFit: "cover",
  },
  headerText: {
    margin: 0,
    color: "white",
    fontSize: "1.75rem",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  headerSubtext: {
    margin: "4px 0 12px 0",
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: "0.95rem",
    fontWeight: "400",
  },
  conversationControls: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
    justifyContent: "center",
  },
  controlButton: {
    padding: "8px 20px",
    borderRadius: "25px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    background: "rgba(255, 255, 255, 0.15)",
    color: "white",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    fontWeight: "normal",
    minWidth: "100px",
    textAlign: "center",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.25)",
    },
    "&:active": {
      transform: "translateY(1px)",
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    }
  },
  savedConversationsPanel: {
    background: "#fff",
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
    maxHeight: "240px",
    overflowY: "auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    animation: "slideDown 0.3s ease-in-out",
    zIndex: 1,
  },
  savedConversationsTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
    margin: "0 0 12px 0",
    borderBottom: "2px solid #9b59b6",
    paddingBottom: "8px",
    display: "inline-block",
  },
  noConversations: {
    fontSize: "0.9rem",
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: "20px 0",
    background: "#f9f9f9",
    borderRadius: "8px",
  },
  conversationsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  conversationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderRadius: "10px",
    background: "#f5f5f8",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid transparent",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    "&:hover": {
      background: "#f0e8f5",
      borderColor: "rgba(155, 89, 182, 0.3)",
      transform: "translateY(-1px)",
    },
  },
  conversationInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  conversationTitle: {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#333",
  },
  conversationDate: {
    fontSize: "0.75rem",
    color: "#666",
  },
  deleteButton: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(155, 89, 182, 0.1)",
    color: "#9b59b6",
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "rgba(155, 89, 182, 0.2)",
      color: "#8e44ad",
      transform: "scale(1.1)",
    },
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "10px 0",
    maxHeight: "calc(100vh - 190px)",
    backgroundColor: "#ffffff",
    scrollBehavior: "smooth",
  },
  loadingIndicator: {
    padding: "16px",
    textAlign: "center",
    fontStyle: "italic",
    color: "#9b59b6",
    fontSize: "0.9rem",
    opacity: 0.8,
    animation: "pulse 2s infinite ease-in-out",
  },
  typingIndicatorContainer: {
    display: "flex",
    alignItems: "flex-start",
    margin: "8px 0 12px 16px",
  },
  typingAvatar: {
    width: "38px",
    height: "38px",
    marginRight: "10px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  typingAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  typingBubble: {
    display: "flex",
    alignItems: "center",
    background: "#f0f4f9",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "70px",
    height: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    border: "1px solid #e0e7f0",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#9b59b6",
    borderRadius: "50%",
    margin: "0 3px",
    opacity: 0.7,
    animation: "bounce 1.4s infinite ease-in-out both",
    animationDelay: "calc(var(--i) * 0.2s)",
  },
  "@media (max-width: 768px)": {
    header: {
      padding: "14px 10px",
    },
    headerText: {
      fontSize: "1.5rem",
    },
    logoImage: {
      width: "38px",
      height: "38px",
    },
    savedConversationsPanel: {
      maxHeight: "180px",
    },
    controlButton: {
      padding: "6px 15px",
      fontSize: "0.85rem",
      minWidth: "auto",
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
