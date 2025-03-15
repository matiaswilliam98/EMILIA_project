import React, { useState } from "react";
import "./Survey.css";

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

  const handleNext = () => {
    if (answers[step] === "") {
      alert("Por favor, completa esta pregunta antes de continuar.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      alert("Encuesta completada. Gracias por participar.");
    }
  };

  const handleChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[step] = e.target.value;
    setAnswers(newAnswers);
  };

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

        <button onClick={handleNext} className="next-button">Siguiente</button>
      </div>
    </div>
  );
};

export default Survey;
