import OpenAI from 'openai';
import type { ApplicationMetadata, RoundMetadata } from '../indexer';
import {
  createAiEvaluationPrompt,
  createEvaluationQuestionPrompt,
  type PromptEvaluationQuestions,
  type PromptEvaluationResult,
} from './prompt';
import { createLogger } from '@/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const logger = createLogger();

const queryOpenAI = async (prompt: string): Promise<string> => {
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

    const result = response.choices[0].text.trim();

    return result;
  } catch (error) {
    logger.error('Error calling OpenAI API:', { error });
    throw error;
  }
};

export const requestEvaluation = async (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata
): Promise<PromptEvaluationResult> => {
  const prompt: string = createAiEvaluationPrompt(
    roundMetadata,
    applicationMetadata
  );
  const result = await queryOpenAI(prompt);
  logger.info('Application evaluation complete', { result });
  return JSON.parse(result);
};

export const requestEvaluationQuestions = async (
  roundMetadata: RoundMetadata
): Promise<PromptEvaluationQuestions> => {
  logger.debug('Requesting evaluation questions from OpenAI');
  const prompt: string = createEvaluationQuestionPrompt(roundMetadata);
  const result = await queryOpenAI(prompt);
  logger.info('Received evaluation questions from OpenAI', { result });
  return result
    .split('\n')
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(line => line.length > 0);
};
