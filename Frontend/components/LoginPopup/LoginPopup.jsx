import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import "./LoginPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const LoginPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  // URL del backend corregida
  const backendUrl = "http://localhost:5000/api/auth"; 

  // Manejo de inputs
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificación de contraseñas en el frontend (pero no se envía al backend)
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    // Solo enviamos `email` y `password` al backend
    const requestData = {
      email: formData.email,
      password: formData.password,
    };

    // Definir la URL correcta
    const url = isLogin ? `${backendUrl}/login` : `${backendUrl}/register`;

    try {
      console.log("📡 Enviando solicitud a:", url);
      const response = await axios.post(url, requestData, {
        withCredentials: true, // ✅ Si el backend usa cookies/sesiones
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Respuesta del backend:", response.data);
      if (response.data.success) {
        if (isLogin) {
          const { token, user } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          navigate("/dashboard");
        } else {
          alert("¡Usuario registrado correctamente!");
          onClose(); // Cierra el popup de registro
        }
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error.response?.status, error.response?.data);
      setMessage(error.response?.data?.message || "Error en la solicitud.");
    }
    ///
  };
/////////////////////////////
  return (
    <div className="login-popup-container">
      <div className="login-popup">
        {/* Lado izquierdo con imagen */}
        <div className="left-panel">
          <img src="personaje.png" alt="Descripción" className="login-image" />
        </div>

        {/* Lado derecho (formulario) */}
        <div className="right-panel">
          <h2 className="welcome-text">{isLogin ? "BIENVENIDO" : "Register"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input-container">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {!isLogin && (
              <div className="input-container">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          </form>

          {message && <p className="message">{message}</p>}

          <div className="social-login">
            <button className="google">
              <img src="/google.svg" alt="Google" className="social-icon" />
            </button>
            <button className="facebook">
              <img src="/facebook.svg" alt="Facebook" className="social-icon" />
            </button>
          </div>

          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register Now" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

LoginPopup.propTypes = {
  onClose: PropTypes.func,
};

export default LoginPopup;