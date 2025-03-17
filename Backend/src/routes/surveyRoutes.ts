import express, { RequestHandler } from "express";
import { submitSurvey, getUserProfile } from "../controllers/surveyController";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// All survey routes require authentication
router.use(authenticate);

// Submit survey data
router.post("/submit", submitSurvey as RequestHandler);

// Get user profile with survey data
router.get("/profile", getUserProfile as RequestHandler);

export default router; 