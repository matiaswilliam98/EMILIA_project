import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const LoginPopup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false); // Estado del modal
  const [message, setMessage] = useState("");

  // URL del backend usando proxy configurado en vite.config.js
  const backendUrl = "/api/auth";

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
    //validacion de que marque el checkbox
    if (!isLogin && !acceptTerms) {
      setMessage("Debes aceptar los términos y condiciones para registrarte.");
      return;
    }

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
        // Store token in localStorage regardless of login or register
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (isLogin) {
          // If login, redirect to dashboard
          navigate("/dashboard");
        } else {
          // If register, redirect to survey
          navigate("/survey");
        }
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      
      // Mejor manejo de errores para identificar problemas específicos
      if (error.name === 'NetworkError' || !error.response) {
        setMessage("Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.");
      } else if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setMessage(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
      } else {
        setMessage("Error en la solicitud. Intente nuevamente.");
      }
    }
    ///
  };
/////////////////////////////
  return (
    <div className="login-container">
     <div className="login-popup-container">
      <div className="login-popup">
      {message && <div className="message">{message}</div>}
        {/* Lado izquierdo con imagen */}
        <div className="left-panel">
          <img src="emiliaPersonaje2.png" alt="Descripción" className="login-image" />
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
               <>
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
               {/* 📌 Checkbox de Términos y Condiciones */}
               <div className="terms-container">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(!acceptTerms)}
                    />
                    <label htmlFor="termsCheckbox" className="terms-label">
                      I accept the{" "}
                      <button
                        type="button"
                        className="terms-link"
                        onClick={() => setTermsModalOpen(true)}
                      >
                        terms and conditions
                      </button>
                    </label>
                  </div>
                </>
            )}

            <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          </form>

          

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
     {/* 📌 Modal de Términos y Condiciones */}
     {termsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>
              This app is a test prototype that provides emotional support and
              protects your data. We will not share your information, and it
              does not replace professional help.
            </p>
            <div className="modal-buttons">
              <button
                className="ok-button"
                onClick={() => setTermsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPopup;