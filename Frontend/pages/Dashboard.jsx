import React from 'react';
import { Routes, Route } from "react-router-dom";
import Sidebar from '../components/sidebar/Sidebar'; // Importa el componente Sidebar
import './Dashboard.css'; // Importa el CSS específico para Dashboard


import Chat from "./Chat";
import Calendar from "./Calendar";
import TodoList from "./TodoList";
import Opinion from "./Opinion";
import Video from "./Video";

const Dashboard = () => {
  return (
    <>
      {/* Enlaces a fuentes y estilos externos */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Contenedor del dashboard */}
      <div className="dashboard-container">
        <Sidebar />

        {/* Contenido principal del dashboard */}
        <div className="main-content">
        <Routes>
        <Route index element={
            <div 
            style={{ 
              textAlign: "center", 
              marginBottom: "10px", 
              width: "80%", 
              padding: "20px",
              overflow: "hidden",
              maxWidth: "800px", // Se mantiene más grande en pantallas grandes
              margin: "auto", // Centramos el contenido
            }}
          >
            <h1 className="responsive-text" 
               style={{
               fontWeight: "bold",
               color: "#2C2451",
               opacity: 0,
               animation: "fadeIn 1s ease-out forwards",
               maxWidth: "100%", 
             }}>
             Bienvenido(a) <br /> Tómate un respiro, este es tu espacio.
            </h1>
            
            <img
              src="Standard-Mode-que-el-personaje-unscreen.gif"
              alt="Bienvenida"
              style={{ width: "500px", borderRadius: "60px", marginTop: "40px" , marginLeft: "-90px" }}
            />
          
          <style>
 {`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .responsive-text {
      font-size: 3rem; /* Tamaño grande por defecto */
    }

    @media (max-width: 768px) {
      .responsive-text {
        font-size: 2rem; /* Tamaño reducido en pantallas pequeñas */
      }
    }
  `}
</style>
          </div>
          
          
          
          } />
          <Route path="chat" element={<Chat />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todo" element={<TodoList />} />
          <Route path="opinion" element={<Opinion />} />
          <Route path="video" element={<Video />} />
        </Routes>
        </div>
      </div>
    </>
  );
};

export default Dashboard;