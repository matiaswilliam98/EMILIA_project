import { Request, Response } from "express";
import { createOrUpdateSurvey, getUserWithSurvey, SurveyData } from "../services/surveyService";

// Interface for the authenticated request
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

// Submit survey data
export const submitSurvey = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const userId = req.user.id;
    
    // Extract survey data with required fields
    const surveyData: SurveyData = {
      name: req.body.name,
      gender: req.body.gender,
      age: req.body.age,
      personalityType: req.body.personalityType,
      wellbeingResponses: req.body.wellbeingResponses,
      diagnosticResults: req.body.diagnosticResults
    };

    const survey = await createOrUpdateSurvey(userId, surveyData);
    res.status(200).json({ success: true, survey });
  } catch (error) {
    console.error("Error submitting survey:", error);
    res.status(500).json({ error: "Error al guardar la encuesta" });
  }
};

// Get user profile with survey data
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }
    
    const userId = req.user.id;
    const user = await getUserWithSurvey(userId);
    
    // Remove password from the response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Error al obtener el perfil del usuario" });
  }
}; 