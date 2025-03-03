import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/authService";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🔍 Datos recibidos en el registro:", req.body);
    const newUser = await registerUser(req.body);
    console.log("✅ Usuario registrado:", newUser);
    res.status(201).json({
      success: true,
      message: "Usuario registrado con éxito.",
      newUser,
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
    await logoutUser(user.id);
    res.json({ success: true, message: "Sesión cerrada con éxito" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
