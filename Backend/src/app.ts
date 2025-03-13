import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import "dotenv/config";

const app = express();

app.use(cors({ 
  origin: "https://emilia-project-prueba.vercel.app",
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("✅ Servidor funcionando");
});
export default app;
