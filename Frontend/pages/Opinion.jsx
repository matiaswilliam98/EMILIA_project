import React from "react";
import FeedbackModal from "../components/modals/FeedbackModal"; // Ajusta la ruta si es necesario

const Opinion = () => {
  return (
    <div className="p-6 text-center">
      {/* Renderiza el formulario directamente en la página */}
      <FeedbackModal />
    </div>
  );
};

export default Opinion;
