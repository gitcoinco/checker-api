import { type RoundMetadata } from '../indexer/types';

export type PromptEvaluationQuestions = string[];

export const essentialRoundFields: Array<keyof RoundMetadata> = [
  'name',
  'roundType',
  'eligibility',
];

export const essentialApplicationFields = ['project', 'answers', 'description'];
