import { type ApplicationMetadata, type RoundMetadata } from '../indexer/types';

export type PromptEvaluationQuestions = string[];

export const essentialRoundFields: Array<keyof RoundMetadata> = [
  'name',
  'roundType',
  'eligibility',
];

export const essentialApplicationFields: Array<keyof ApplicationMetadata> = [
  'application',
];
