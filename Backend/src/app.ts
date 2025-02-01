import express from "express";
import userController from "./controllers/userController";  // Asegúrate de importar el archivo correctamente
import cors from "cors";


const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));
app.use(express.json());  // Para manejar JSON en las solicitudes

// Usar las rutas del controlador de usuario
app.use("/auth", userController);

// Puerto en el que se ejecuta la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
