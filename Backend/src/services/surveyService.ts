import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

// Updated interface for the new survey data structure
export interface SurveyData {
  name: string;
  gender: string;
  age: string;
  personalityType: string;
  
  // New fields
  wellbeingResponses: {
    cheerful: string;
    calm: string;
    active: string;
    rested: string;
    interesting: string;
    depressed: string;
    anxious: string;
    hopeless: string;
    peaceful: string;
    happy: string;
  };
  
  diagnosticResults: {
    who5Score: number;
    who5Result: string;
    mhi5Score: number;
    mhi5Result: string;
  };
}

// Cast prisma to any to bypass TypeScript errors until the Prisma client is properly generated
const prismaAny = prisma as any;

export const createOrUpdateSurvey = async (userId: number, data: SurveyData) => {
  try {
    // Check if survey already exists for this user
    const existingSurvey = await prismaAny.survey.findUnique({
      where: { userId }
    });

    // Create the update data object
    const surveyData = {
      name: data.name,
      gender: data.gender,
      age: data.age,
      personalityType: data.personalityType,
      wellbeingResponses: data.wellbeingResponses,
      diagnosticResults: data.diagnosticResults
    };

    if (existingSurvey) {
      // Update existing survey
      return await prismaAny.survey.update({
        where: { userId },
        data: surveyData
      });
    } else {
      // Create new survey
      return await prismaAny.survey.create({
        data: {
          userId,
          ...surveyData
        }
      });
    }
  } catch (error) {
    console.error("Error creating/updating survey:", error);
    throw error;
  }
};

export const getUserWithSurvey = async (userId: number) => {
  try {
    const user = await prismaAny.user.findUnique({
      where: { id: userId },
      include: {
        survey: true
      }
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  } catch (error) {
    console.error("Error retrieving user with survey:", error);
    throw error;
  }
}; 