import express, { RequestHandler } from "express";
import { register, login, logout } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();
router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/logout", authenticate, logout as RequestHandler);

export default router;
