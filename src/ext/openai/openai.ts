import OpenAI from 'openai';
import type { ApplicationMetadata, RoundMetadata } from '@/ext/indexer';
import type { PromptEvaluationQuestions } from '@/ext/openai/types';
import {
  createAiEvaluationPrompt,
  createEvaluationQuestionPrompt,
} from '@/ext/openai/prompt';
import { createLogger } from '@/logger';
import { type EvaluationSummaryInput } from '@/service/EvaluationService';
import { env } from '@/env';
import { parseArray, parseObject } from '@/utils';
import pLimit from 'p-limit';
import LRUCache = require('lru-cache');

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const logger = createLogger();

// Create a concurrency limiter
const limit = pLimit(5); // Maximum 5 concurrent OpenAI calls

const evaluationCache = new LRUCache<string, EvaluationSummaryInput>({
  maxSize: 100 * 1024 * 1024, // 100MB
  sizeCalculation: value => JSON.stringify(value).length,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

const queryOpenAI = async (prompt: string): Promise<string> => {
  return await limit(async () => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.2,
      });

      logger.debug(
        'Received response from OpenAI:',
        JSON.stringify(response, null, 2)
      );

      const result = response.choices?.[0]?.message?.content?.trim() ?? '';

      if (result === '') {
        throw new Error('Empty response from OpenAI');
      }

      return result;
    } catch (error) {
      logger.error('Error calling OpenAI API:', { error });
      throw error;
    }
  });
};

export const requestEvaluation = async (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata,
  questions: PromptEvaluationQuestions
): Promise<EvaluationSummaryInput> => {
  const cacheKey = JSON.stringify({
    applicationId: applicationMetadata.application.project.title,
    roundId: roundMetadata.name,
    questionsHash: questions.join(','),
  });

  const cached = evaluationCache.get(cacheKey);
  if (cached !== undefined && cached !== null) {
    logger.debug('Using cached evaluation');
    return cached;
  }

  const prompt: string = createAiEvaluationPrompt(
    roundMetadata,
    applicationMetadata,
    questions
  );
  const result = await queryOpenAI(prompt);
  logger.info('Application evaluation complete', { result });
  const evaluation = parseObject(result) as EvaluationSummaryInput;
  evaluationCache.set(cacheKey, evaluation);
  return evaluation;
};

export const requestEvaluationQuestions = async (
  roundMetadata: RoundMetadata
): Promise<PromptEvaluationQuestions> => {
  logger.debug('Requesting evaluation questions from OpenAI');
  const prompt: string = createEvaluationQuestionPrompt(roundMetadata);
  const result = await queryOpenAI(prompt);
  logger.info('Received evaluation questions from OpenAI', { result });
  return parseArray(result).map(line => line.replace(/^\d+\.\s*/, '').trim());
};
