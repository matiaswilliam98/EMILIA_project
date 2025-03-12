import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // ✅ Verifica si el usuario tiene sesión activa

  return token ? children : <Navigate to="/" replace />; // ✅ Redirige si no hay sesión
};

export default ProtectedRoute;
