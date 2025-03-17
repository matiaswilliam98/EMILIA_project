import React, { useState } from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import './Sidebar.css'; // Importa el CSS específico para Sidebar

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("⚠️ No hay token en localStorage, no se puede cerrar sesión.");
        return;
      }
  
      console.log("📡 Enviando solicitud de logout al backend...");
  
      const response = await fetch("https://emiliaproject-production.up.railway.app/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("✅ Respuesta del backend recibida:", response);
  
      if (!response.ok) {
        console.error("❌ Error en la respuesta del backend:", await response.json());
        return;
      }
  
      // ✅ Eliminar token del frontend
      localStorage.removeItem("token");
      localStorage.removeItem("user");
  
      console.log("🔄 Redirigiendo al login...");
      window.location.href = "/"; // Fuerza la redirección
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  };
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h3 className="brand">
        <img src="/emiliaPersonaje2.jpeg" alt="Logo" style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "15px" }} />
          {!isCollapsed && <span>MyApp</span>}
        </h3>
        <div className="toggle-btn" onClick={toggleSidebar}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} toggle-icon`}></i>
        </div>
      </div>
      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard" className="nav-item">
            <span className="nav-icon"><i className="fas fa-home"></i></span>
            {!isCollapsed && <span>Home</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/chat" className="nav-item">
            <span className="nav-icon"><i className="fas fa-comments"></i></span>
            {!isCollapsed && <span>Chat</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendar" className="nav-item">
            <span className="nav-icon"><i className="fa-solid fa-calendar"></i></span>
            {!isCollapsed && <span>Calendar</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/video" className="nav-item">
            <span className="nav-icon"><i className="fas fa-video"></i></span>
            {!isCollapsed && <span>Video</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/todo"className="nav-item">
            <span className="nav-icon"><i className="fa-solid fa-list-check"></i></span>
            {!isCollapsed && <span>To-Do List</span>}
            </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/opinion" className="nav-item">
            <span className="nav-icon"><i className="fas fa-clipboard-list"></i></span>
            {!isCollapsed && <span>Opinion</span>}
          </NavLink>
        </li>
      </ul>
      <li className="logout">
  <a href="#" className="nav-item" onClick={(e) => {
    e.preventDefault();
    console.log("Logout clickeado"); // ✅ Verificación
    handleLogout();
  }}>
    <span className="nav-icon"><i className="fas fa-sign-out-alt"></i></span>
    {!isCollapsed && <span>Logout</span>}
  </a>
</li>

    </div>
  );
};

export default Sidebar;
