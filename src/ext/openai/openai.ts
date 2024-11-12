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

    console.log('=======>A4', response);
    console.log('=======>A5', response.choices[0]);
    console.log('=======>A6', response.choices[0].text);
    console.log('=======>A7', response.choices[0].text.trim());
    const shit = response.choices[0].text.trim();
    const questions = shit.split('\n');

    console.log('====> A9', questions);

    const result: T = JSON.parse(questions);
    console.log('=======>A8', result);

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
  // logger.debug(`Evaluating application with ID: ${applicationMetadata}`);
  const prompt: string = createAiEvaluationPrompt(
    roundMetadata,
    applicationMetadata
  );
  const result = await queryOpenAI<PromptEvaluationResult>(prompt);
  logger.info('Application evaluation complete', { result });
  return result;
};

export const requestEvaluationQuestions = async (
  roundMetadata: RoundMetadata
): Promise<PromptEvaluationQuestions> => {
  logger.debug('Requesting evaluation questions from OpenAI');
  const prompt: string = createEvaluationQuestionPrompt(roundMetadata);
  const result = await queryOpenAI<PromptEvaluationQuestions>(prompt);
  logger.info('Received evaluation questions from OpenAI', { result });
  return result;
};
