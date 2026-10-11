import { AiAssistantService } from '../services/aiAssistantService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const askAiAssistant = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return errorResponse(res, 'A prompt message is required.', 400);
    }

    const result = await AiAssistantService.answerSafetyQuery(prompt);
    return successResponse(res, result, 'Safety assistant response generated');
  } catch (error) {
    next(error);
  }
};
