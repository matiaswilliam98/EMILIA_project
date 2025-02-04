import { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./LoginPopup.css";

const LoginPopup = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  // Ajustamos el estado para que coincida con los campos que espera el backend.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    ciudad: "",
    dni: "",
    telefono: "",
    ruc: "",
  });
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:3000/auth/login"
      : "http://localhost:3000/auth/register";

    try {
      const response = await axios.post(url, formData);
      console.log("Respuesta del servidor:", response.data);

      if (isLogin && response.data.success) {
        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("Token guardado:", token);
        console.log("Usuario guardado:", user);
        // Si deseas, puedes redirigir o recargar la página:
        // window.location.reload();
        onClose(); // Cierra el popup después de iniciar sesión

      } else if (!isLogin && response.data.success) {
        alert("¡Usuario registrado correctamente!");

        console.log("Intentando iniciar sesión automáticamente...");

        // Realiza el login automático después de registrar
        try {
          const loginResponse = await axios.post(
            "http://localhost:3000/auth/login",
            {
              email: formData.email,
              password: formData.password,
            }
          );

          if (loginResponse.data.success) {
            const { token, user } = loginResponse.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            console.log("Inicio de sesión automático exitoso.");
            // Si deseas, redirige o recarga la página:
            // window.location.reload();
            onClose(); // Cierra el popup después del login automático
          } else {
            console.error("Error al iniciar sesión automáticamente.");
          }
        } catch (loginError) {
          console.error(
            "Error al iniciar sesión automático:",
            loginError.message
          );
        }
      }
    } catch (error) {
      console.error("Error en el registro/inicio de sesión:", error.message);
      setMessage(error.response?.data?.message || "Error en la solicitud.");
    }
  };

  return (
    <div className="login-popup">
      <button className="close-button" onClick={onClose}>
        ✖
      </button>
      <img src="logo.png" alt="Login Illustration" className="login-image" />
      <div className="tabs">
        <button
          onClick={() => setIsLogin(true)}
          className={isLogin ? "active" : ""}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={!isLogin ? "active" : ""}
        >
          Registrarse
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              style={{ color: "#000000" }}
            />
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              required
              style={{ color: "#000000" }}
            />
            <input
              type="text"
              name="ciudad"
              placeholder="Ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              required
              style={{ color: "#000000" }}
            />
            <input
              type="text"
              name="dni"
              placeholder="Número de Identidad"
              value={formData.dni}
              onChange={handleInputChange}
              required
              style={{ color: "#000000" }}
            />
            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange}
              required
              style={{ color: "#000000" }}
            />
            <input
              type="text"
              name="ruc"
              placeholder="RUC (Opcional)"
              value={formData.ruc}
              onChange={handleInputChange}
              style={{ color: "#000000" }}
            />
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          value={formData.email}
          onChange={handleInputChange}
          required
          style={{ color: "#000000" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleInputChange}
          required
          style={{ color: "#000000" }}
        />
        <button type="submit">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

LoginPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default LoginPopup;
