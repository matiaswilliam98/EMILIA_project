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
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    // Add user message to the state
    setMessages((prev) => [...prev, { from: "user", text: message }]);
    setIsLoading(true);

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
      
      // Add bot response to the state
      setMessages((prev) => [...prev, { from: "bot", text: botResponseText }]);
      
      // Update memory with the new messages
      await memory.current.saveContext(
        { input: message },
        { output: botResponseText }
      );
    } catch (error) {
      console.error("Error getting response from AI:", error);
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
    // No incluimos el mensaje del sistema aquí, lo añadiremos por separado
    return messages.map(msg => ({
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text
    }));
  };

  return (
    <div style={styles.chatContainer}>
      {/* ENCABEZADO DEL CHAT */}
      <div style={styles.header}>
        <h2 style={styles.headerText}>EMILIA - Asistente Terapéutico</h2>
        <p style={styles.headerSubtext}>
          {configError 
            ? "⚠️ Error de configuración. Verifica el archivo .env" 
            : "Un espacio seguro para expresarte y recibir apoyo"}
        </p>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div style={styles.messageList}>
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
        {isLoading && <div style={styles.loadingIndicator}>EMILIA está reflexionando...</div>}
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

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "90vh", 
    width: "calc(100% - 20px)",
    borderRadius: "12px",
    background: "#f8f9fa",
    overflow: "hidden", 
    margin: "auto", 
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #7e57c2 0%, #9b59b6 100%)",
    color: "white",
    padding: "15px 20px",
    textAlign: "center",
  },
  headerText: {
    margin: 0,
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  headerSubtext: {
    margin: "5px 0 0 0",
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "0.9rem",
    fontWeight: "normal",
  },
  modelInfo: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "0.8rem",
    display: "block",
    marginTop: "4px",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "15px",
    maxHeight: "calc(100vh - 180px)",
    backgroundColor: "#f8f9fa",
  },
  loadingIndicator: {
    padding: "10px",
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
    fontSize: "0.9rem",
  },
  "@media (max-width: 768px)": {
    chatContainer: {
      width: "100%", 
      height: "100vh", 
      borderRadius: "0",
    },
  },
  "@media (max-width: 1024px)": {
    chatContainer: {
      width: "calc(100% - 10px)",
    },
  },
};

export default ChatComponent;
