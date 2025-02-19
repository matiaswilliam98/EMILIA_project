import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";

const app = express();

app.use(cors({ origin: "*" })); // 🔥 Permitir solicitudes de cualquier origen
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("✅ Servidor funcionando");
});
export default app;
