import express, { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Definir una nueva interfaz para extender Request y agregar la propiedad user
interface AuthRequest extends Request {
  user?: User;
}

// Registro de usuario
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, ciudad, dni, telefono, ruc, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: "El correo ya está registrado." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { nombre, apellido, ciudad, dni, telefono, ruc, email, password: hashedPassword, token: null }
    });

    res.status(201).json({ success: true, message: "Usuario registrado con éxito." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error en el registro", error: error.message });
  }
});

// Inicio de sesión
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ success: false, message: "Usuario no encontrado." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Contraseña incorrecta." });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    // ✅ Guarda el token en la base de datos (sobrescribe el anterior)
    await prisma.user.update({
      where: { id: user.id },
      data: { token }
    });

    res.json({ success: true, token, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error en el inicio de sesión", error: error.message });
  }
});

// Middleware para verificar el token
const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ success: false, message: "Acceso denegado" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.token !== token) {
      res.status(401).json({ success: false, message: "Sesión inválida, inicie sesión nuevamente" });
      return;
    }

    req.user = user; // ✅ Ahora TypeScript reconoce `req.user`
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Token inválido" });
  }
};

// Cerrar sesión
router.post("/logout", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Usuario no autenticado" });
      return;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { token: null }
    });

    res.json({ success: true, message: "Sesión cerrada con éxito" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error al cerrar sesión", error: error.message });
  }
});

export default router;

