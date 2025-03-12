import React from 'react';
import { Routes, Route } from "react-router-dom";
import Sidebar from '../components/sidebar/Sidebar'; // Importa el componente Sidebar
import './Dashboard.css'; // Importa el CSS específico para Dashboard


import Chat from "./Chat";
import Calendar from "./Calendar";
import TodoList from "./TodoList";


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
            <div>
              <h1>Dashboard</h1>
              <p>Bienvenido al panel de administración.</p>
            </div>
          } />
          <Route path="chat" element={<Chat />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todo" element={<TodoList />} />
        </Routes>
        </div>
      </div>
    </>
  );
};

export default Dashboard;