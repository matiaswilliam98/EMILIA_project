import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import surveyRoutes from "./routes/surveyRoutes";
import "dotenv/config";

const app = express();

app.use(cors({ 
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/survey", surveyRoutes);

app.get("/", (req, res) => {
  res.send("✅ Servidor funcionando");
});
export default app;
