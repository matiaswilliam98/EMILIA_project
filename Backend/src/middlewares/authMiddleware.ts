import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ success: false, message: "Acceso denegado" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
    };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.token !== token) {
      res
        .status(401)
        .json({
          success: false,
          message: "Sesión inválida, inicie sesión nuevamente",
        });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token inválido" });
  }
};
