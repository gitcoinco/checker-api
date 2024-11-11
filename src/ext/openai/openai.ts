import OpenAI from 'openai';
import type { ApplicationMetadata, RoundMetadata } from '../indexer';
import {
  createAiEvaluationPrompt,
  createEvaluationQuestionPrompt,
  type EvaluationQuestions,
  type EvaluationResult,
} from './prompt';
import { createLogger } from '@/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const logger = createLogger();

const queryOpenAI = async <T>(prompt: string): Promise<T> => {
  try {
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    logger.debug(
      'Received response from OpenAI:',
      JSON.stringify(response, null, 2)
    );

    const result: T = JSON.parse(response.choices[0].text.trim());
    return result;
  } catch (error) {
    logger.error('Error calling OpenAI API:', { error });
    throw error;
  }
};

export const requestEvaluation = async (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata
): Promise<EvaluationResult> => {
  // logger.debug(`Evaluating application with ID: ${applicationMetadata}`);
  const prompt = createAiEvaluationPrompt(roundMetadata, applicationMetadata);
  const result = await queryOpenAI<EvaluationResult>(prompt);
  logger.info('Application evaluation complete', { result });
  return result;
};

export const requestEvaluationQuestions = async (
  roundMetadata: RoundMetadata
): Promise<EvaluationQuestions> => {
  logger.debug('Requesting evaluation questions from OpenAI');
  const prompt = createEvaluationQuestionPrompt(roundMetadata);
  const result = await queryOpenAI<EvaluationQuestions>(prompt);
  logger.info('Received evaluation questions from OpenAI', { result });
  return result;
};
