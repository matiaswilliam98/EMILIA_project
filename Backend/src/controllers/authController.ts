import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/authService";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Datos recibidos en el registro:", req.body);
    const newUser = await registerUser(req.body);
    
    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );
    
    // Update user with token
    await prisma.user.update({
      where: { id: newUser.id },
      data: { token }
    });
    
    console.log("✅ Usuario registrado:", newUser);
    res.status(201).json({
      success: true,
      message: "Usuario registrado con éxito.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error("❌ Error en el registro:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ success: true, token, user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(400).json({ success: false, message: "Usuario no autenticado." });
      return;
    }

    const result = await logoutUser(user.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error al cerrar sesión.", error: error.message });
  }
};
