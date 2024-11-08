import OpenAI from 'openai';
import type { Application } from '../indexer';
import { createPrompt, type EvaluationResult } from './prompt';
import { createLogger } from '@/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const logger = createLogger();

export const requestEvaluation = async (
  application: Application
): Promise<EvaluationResult> => {
  try {
    logger.debug(`Evaluating application with ID: ${application.id}`);

    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt: createPrompt(application),
      max_tokens: 150,
      temperature: 0.7,
    });

    logger.debug(
      'Received response from OpenAI:',
      JSON.stringify(response, null, 2)
    );

    const result: EvaluationResult = JSON.parse(
      response.choices[0].text.trim()
    );

    logger.info('Application evaluation complete', { result });
    return result;
  } catch (error) {
    logger.error('Error calling OpenAI API:', { error });
    throw error;
  }
};
