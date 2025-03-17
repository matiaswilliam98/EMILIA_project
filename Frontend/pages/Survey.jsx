import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Survey.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const questions = [
  { question: "Escribe tu nombre:", type: "text" },
  {
    question: "Selecciona tu género:",
    type: "select",
    options: ["Hombre", "Mujer", "Otro"]
  },
  { question: "Escribe tu edad:", type: "text" },
  {
    question: "¿Cómo te describirías?",
    type: "options",
    options: ["Introvertido", "Extrovertido", "Ambivertido"]
  },
  {
    question: "¿Qué tan seguido te sientes estresado?",
    type: "options",
    options: ["Casi nunca", "A veces", "Frecuentemente", "Siempre"]
  },
  {
    question: "¿Cómo manejas la ansiedad?",
    type: "options",
    options: ["Ejercicio", "Meditación", "Hablar con alguien", "No sé cómo manejarla"]
  },
  {
    question: "¿Cuál es tu mayor fuente de motivación?",
    type: "options",
    options: ["Familia", "Trabajo/estudios", "Amigos", "Yo mismo"]
  },
  {
    question: "¿Cómo reaccionas ante situaciones inesperadas?",
    type: "options",
    options: ["Me estreso fácilmente", "Me adapto rápido", "Depende de la situación"]
  },
  {
    question: "¿Qué tan importante es para ti la opinión de los demás?",
    type: "options",
    options: ["Muy importante", "Algo importante", "Poco importante", "Nada importante"]
  },
];

const Survey = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Por favor inicia sesión para completar la encuesta' } });
    }
  }, [navigate]);

  const handleNext = async () => {
    if (answers[step] === "") {
      alert("Por favor, completa esta pregunta antes de continuar.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Submit the survey
      await submitSurvey();
    }
  };

  const handleChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[step] = e.target.value;
    setAnswers(newAnswers);
  };
  
  const submitSurvey = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }
      
      const surveyData = {
        name: answers[0],
        gender: answers[1],
        age: answers[2],
        personalityType: answers[3],
        stressFrequency: answers[4],
        anxietyManagement: answers[5],
        motivationSource: answers[6],
        unexpectedReaction: answers[7],
        opinionImportance: answers[8]
      };
      
      await axios.post(`${API_URL}/survey/submit`, surveyData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCompleted(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError(err.response?.data?.error || err.message || 'Error al enviar la encuesta');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoToChat = () => {
    navigate('/chat');
  };

  // Show success page if completed
  if (completed) {
    return (
      <div className="survey-container">
        <div className="success-box">
          <h2>¡Gracias por completar la encuesta!</h2>
          <p>Tus respuestas nos ayudarán a personalizar tu experiencia con EMILIA.</p>
          <button onClick={handleGoToChat} className="chat-button">
            Ir al chat con EMILIA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container">
      <div className="question-box">
        <p className="question-text">{questions[step].question}</p>

        {questions[step].type === "text" && (
          <input
            type="text"
            value={answers[step]}
            onChange={handleChange}
            placeholder="Escribe tu respuesta..."
            className="input-field"
          />
        )}

        {questions[step].type === "select" && (
          <select value={answers[step]} onChange={handleChange} className="input-field">
            <option value="">Selecciona</option>
            {questions[step].options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )}

        {questions[step].type === "options" && (
          <div className="options">
            {questions[step].options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${answers[step] === option ? "selected" : ""}`}
                onClick={() => handleChange({ target: { value: option } })}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}

        <button 
          onClick={handleNext} 
          className="next-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : 
            step < questions.length - 1 ? "Siguiente" : "Completar"}
        </button>
        
        <div className="progress-indicator">
          {step + 1} de {questions.length}
        </div>
      </div>
    </div>
  );
};

export default Survey;
