import { useState } from "react";
import "./FeedbackForm.css";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    experience: "",
    favorite: "",
    issues: "",
    improvements: "",
    recommendation: "0",
  });

  const [selectedExperience, setSelectedExperience] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleExperienceSelect = (label) => {
    setFormData({ ...formData, experience: label });
    setSelectedExperience(label); // Actualiza la selección visual
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const scriptURL = "https://script.google.com/macros/s/AKfycbxDBLfv8ivRZf3rK5ypO6sEpLFjrtKcUlQSsARbc9gFkP8WVjZL4QuWZ3dycuWTOu1f/exec"; // Pega aquí tu URL de Google Apps Script

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      alert("¡Gracias por tu opinión! Los datos han sido enviados.");
      // Limpiar los campos del formulario
      setFormData({
        experience: "",
        favorite: "",
        issues: "",
        improvements: "",
        recommendation: "",
      });
// Resetear la selección de experiencia
setSelectedExperience("");
      // Asegurar que los radio buttons se desmarquen
      document.querySelectorAll("input[type=radio]").forEach(input => input.checked = false);

      // Asegurar que los textarea se vacíen manualmente
      document.querySelectorAll("textarea").forEach(textarea => textarea.value = "");
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("Hubo un problema al enviar los datos.");
    }
  };

  return (
    <div className="feedback-container">
      <form onSubmit={handleSubmit} className="feedback-form">
        
        {/* Experiencia */}
        <div className="form-group">
          <label>¿Cómo calificarías tu experiencia usando Emilia?</label>
          <div 
            className="radio-group" 
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "10px"
            }}
          >
            {[
              { label: "Muy Mal", img: "/muyMal.svg" },
              { label: "Mal", img: "/mal.svg" },
              { label: "Neutral", img: "/neutral.svg" },
              { label: "Bien", img: "/bien.svg" },
              { label: "Muy Bien", img: "/muyBien.svg" }
            ].map(({ label, img }) => (
              <label 
                key={label} 
                className="radio-option"
                onClick={() => handleExperienceSelect(label)} 
                tabIndex="0"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: "5px",
                }}
              >
                <img
                  src={img}
                  alt={label}
                  className="radio-image"
                  aria-label={label}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                    cursor: "pointer",
                    borderRadius: "50%",
                    border: selectedExperience === label ? "3px solid #6a0dad" : "3px solid transparent",
                    transform: selectedExperience === label ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s ease-in-out",
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Comentarios */}
        <div className="form-group">
          <label>¿Qué es lo que más te gustó de EMILIA?</label>
          <textarea name="favorite" onChange={handleChange}></textarea>
        </div>

        <div className="form-group">
          <label>¿Tuviste algún problema técnico mientras usabas EMILIA?</label>
          <textarea name="issues" onChange={handleChange}></textarea>
        </div>

        <div className="form-group">
          <label>¿Qué mejorarías en EMILIA?</label>
          <textarea name="improvements" onChange={handleChange}></textarea>
        </div>

        {/* Recomendación */}
        <div className="form-group">
          <label>En una escala del 0 al 10, ¿qué tan probable es que recomiendes EMILIA?</label>
          <div className="radio-group">
            {[...Array(11).keys()].map((num) => (
              <label key={num} className="radio-option">
                <input
                  type="radio"
                  name="recommendation"
                  value={num}
                  onChange={handleChange}
                />
                {num}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">Enviar</button>
      </form>
    </div>
  );
}
