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
        </div>
      </div>

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
    height: "90vh", 
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
