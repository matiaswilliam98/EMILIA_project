import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Survey.css";

const API_URL = import.meta.env.VITE_API_URL || 'https://emiliaproject-production.up.railway.app/api';

const questions = [
  { 
    question: "¿Cómo te gustaría que te llamemos?:", 
    type: "text" 
  }, 
  {
    question: "Selecciona tu género:",
    type: "select",
    options: ["Hombre", "Mujer", "Otro"]
  },
  { 
    question: "Escribe tu edad:", 
    type: "text" 
  },
  {
    question: "¿Cómo te describirías?",
    type: "options",
    options: ["Introvertido", "Extrovertido", "Ambivertido"]
  },
  {
    question: "Quisiera conocer más de ti, ¿podrías ayudarme rellenando el siguiente test? Esto me permitirá brindarte las herramientas que necesitas.",
    type: "info"
  },
  {
    question: "Responde cada pregunta basándote en cómo te has sentido en las últimas dos semanas. Usa la siguiente escala: \n5 = Todo el tiempo \n4 = La mayor parte del tiempo \n3 = Más de la mitad del tiempo \n2 = Menos de la mitad del tiempo \n1 = Algunas veces \n0 = Nunca",
    type: "info"
  },
  {
    question: "Me he sentido alegre y de buen ánimo.",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "Me he sentido tranquilo y relajado.",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "Me he sentido activo y con energía.",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "Me he despertado sintiéndome fresco y descansado.",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "Mi vida diaria ha estado llena de cosas que me interesan.",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "En las últimas dos semanas, ¿con qué frecuencia te has sentido deprimido o triste?",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "¿Con qué frecuencia te has sentido nervioso o ansioso?",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "¿Con qué frecuencia te has sentido tan deprimido que nada podía animarte?",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "¿Con qué frecuencia te has sentido calmado y tranquilo?",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  },
  {
    question: "¿Con qué frecuencia te has sentido feliz?",
    type: "scale",
    options: [5, 4, 3, 2, 1, 0]
  }
];

// Función para calcular los resultados de los tests
function calculateResults(answers) {
  // Convert string values to numbers for calculations
  const numericAnswers = answers.map(a => typeof a === 'string' && !isNaN(a) ? parseInt(a, 10) : a);
  
  // WHO-5 Wellbeing Index (questions 6-10, indexes 6-10)
  const who5Scores = numericAnswers.slice(6, 11)
    .filter(val => !isNaN(val))
    .reduce((sum, value) => sum + parseInt(value, 10), 0) * 4;
  
  // MHI-5 Mental Health Inventory (questions 11-15, indexes 11-15)
  const mhi5RawScores = numericAnswers.slice(11, 16)
    .filter(val => !isNaN(val))
    .map(val => parseInt(val, 10));
  
  // For MHI-5, questions 11, 12, 14 are scored as is, but 13 and 15 need to be reversed
  const mhi5Reversed = [
    mhi5RawScores[0], 
    mhi5RawScores[1], 
    mhi5RawScores[2],
    5 - mhi5RawScores[3], // Reverse item 14 (index 13)
    5 - mhi5RawScores[4]  // Reverse item 15 (index 14)
  ];
  
  const mhi5Sum = mhi5Reversed.reduce((sum, value) => sum + value, 0);
  const mhi5Scores = (mhi5Sum / 25) * 100;

  let who5Result = who5Scores <= 50 
    ? "Posible depresión (se recomienda evaluación profesional)" 
    : "Buen estado de bienestar";
    
  let mhi5Result = mhi5Scores < 60 
    ? "Posibles problemas emocionales (puede sugerir ansiedad o depresión)" 
    : "Buena salud mental";

  return {
    who5Score: who5Scores,
    who5Result,
    mhi5Score: mhi5Scores,
    mhi5Result
  };
}

const Survey = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Por favor inicia sesión para completar la encuesta' } });
    }
  }, [navigate]);

  const handleNext = async () => {
    // Skip validation for info type questions
    if (questions[step].type === "info") {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        await submitSurvey();
      }
      return;
    }

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

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
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

      // Calculate diagnostic results
      const results = calculateResults(answers);
      setDiagnosticResults(results);
      
      // Prepare survey data mapping relevant answers
      const surveyData = {
        name: answers[0],
        gender: answers[1],
        age: answers[2],
        personalityType: answers[3],
        wellbeingResponses: {
          cheerful: answers[6],
          calm: answers[7],
          active: answers[8],
          rested: answers[9],
          interesting: answers[10],
          depressed: answers[11],
          anxious: answers[12],
          hopeless: answers[13],
          peaceful: answers[14],
          happy: answers[15]
        },
        diagnosticResults: results
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

  const handleComplete = () => {
    navigate('/dashboard');
  };

  // Calculate progress percentage
  const progressPercentage = ((step + 1) / questions.length) * 100;

  // Show success page if completed
  if (completed) {
    return (
      <div className="survey-container">
        <div className="success-box">
          <div className="success-icon">✓</div>
          <h2>¡Gracias por completar la encuesta!</h2>
          
          {diagnosticResults && (
            <div className="diagnostic-results">
              <h3>Resultados del Test</h3>
              <div className="result-item">
                <h4>Índice de Bienestar WHO-5:</h4>
                <p className="score">{diagnosticResults.who5Score}%</p>
                <p className="interpretation">{diagnosticResults.who5Result}</p>
              </div>
              <div className="result-item">
                <h4>Índice de Salud Mental MHI-5:</h4>
                <p className="score">{Math.round(diagnosticResults.mhi5Score)}%</p>
                <p className="interpretation">{diagnosticResults.mhi5Result}</p>
              </div>
            </div>
          )}
          
          <p>Tus respuestas nos ayudarán a personalizar tu experiencia con EMILIA y brindarte un mejor apoyo emocional adaptado a tus necesidades.</p>
          <button onClick={handleComplete} className="chat-button">
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container">
      <div className="question-box">
        <div className="survey-header">
          <div className="logo">
            <img src="/emiliaPersonaje2.jpeg" alt="EMILIA" />
            <h3>EMILIA</h3>
          </div>
          <div className="survey-title">Cuestionario de Personalización</div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        
        {/* Only show question text for non-info type questions */}
        {questions[step].type !== "info" && (
          <p className="question-text">{questions[step].question}</p>
        )}

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

        {questions[step].type === "scale" && (
          <div className="options">
            {questions[step].options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${answers[step] === option.toString() ? "selected" : ""}`}
                onClick={() => handleChange({ target: { value: option.toString() } })}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {questions[step].type === "info" && (
          <div className="info-box">
            {questions[step].question.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="button-container">
          {step > 0 && (
            <button 
              onClick={handlePrevious} 
              className="prev-button"
              disabled={isSubmitting}
            >
              Anterior
            </button>
          )}
          <button 
            onClick={handleNext} 
            className="next-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." :
              step < questions.length - 1 ? "Siguiente" : "Completar"}
          </button>
        </div>

        <div className="progress-indicator">
          {step + 1} de {questions.length}
        </div>
      </div>
    </div>
  );
};

export default Survey;
