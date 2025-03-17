import prisma from "../prisma";
import { PrismaClient } from "@prisma/client";

export interface SurveyData {
  name: string;
  gender: string;
  age: string;
  personalityType: string;
  stressFrequency: string;
  anxietyManagement: string;
  motivationSource: string;
  unexpectedReaction: string;
  opinionImportance: string;
}

// Cast prisma to any to bypass TypeScript errors until the Prisma client is properly generated
const prismaAny = prisma as any;

export const createOrUpdateSurvey = async (userId: number, data: SurveyData) => {
  try {
    // Check if survey already exists for this user
    const existingSurvey = await prismaAny.survey.findUnique({
      where: { userId }
    });

    if (existingSurvey) {
      // Update existing survey
      return await prismaAny.survey.update({
        where: { userId },
        data: {
          name: data.name,
          gender: data.gender,
          age: data.age,
          personalityType: data.personalityType,
          stressFrequency: data.stressFrequency,
          anxietyManagement: data.anxietyManagement,
          motivationSource: data.motivationSource,
          unexpectedReaction: data.unexpectedReaction,
          opinionImportance: data.opinionImportance,
        }
      });
    } else {
      // Create new survey
      return await prismaAny.survey.create({
        data: {
          userId,
          name: data.name,
          gender: data.gender,
          age: data.age,
          personalityType: data.personalityType,
          stressFrequency: data.stressFrequency,
          anxietyManagement: data.anxietyManagement,
          motivationSource: data.motivationSource,
          unexpectedReaction: data.unexpectedReaction,
          opinionImportance: data.opinionImportance,
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