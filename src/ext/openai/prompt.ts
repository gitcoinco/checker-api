import { type ApplicationMetadata, type RoundMetadata } from '@/ext/indexer';
import {
  essentialApplicationFields,
  essentialRoundFields,
  type PromptEvaluationQuestions,
} from './types';

// Function to remove every nth character from a string
const removeEveryNthChar = (str: string, n: number): string => {
  return str
    .split('')
    .filter((_, index) => (index + 1) % n !== 0)
    .join('');
};

// Function to sanitize metadata and then remove every nth character to fit a max length
const sanitizeAndReduceMetadata = (
  metadata: object,
  essentialFields: string[],
  maxLength: number
): string => {
  const sanitizedMetadata = {};

  essentialFields.forEach(field => {
    if (metadata[field] !== undefined) {
      sanitizedMetadata[field] = metadata[field];
    }
  });

  let jsonString = JSON.stringify(sanitizedMetadata, null, 2);

  // Remove every nth character if the JSON string exceeds maxLength
  while (jsonString.length > maxLength) {
    const n = Math.ceil(jsonString.length / maxLength);
    jsonString = removeEveryNthChar(jsonString, n);
  }

  return jsonString;
};

const sanitizeRoundMetadata = (metadata: RoundMetadata): string => {
  return sanitizeAndReduceMetadata(metadata, essentialRoundFields, 1000);
};

const sanitizeApplicationMetadata = (metadata: ApplicationMetadata): string => {
  return sanitizeAndReduceMetadata(metadata, essentialApplicationFields, 1000);
};

export const createAiEvaluationPrompt = (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata,
  applicationQuestions: PromptEvaluationQuestions
): string => {
  const sanitizedRoundMetadata = sanitizeRoundMetadata(roundMetadata);
  const sanitizedApplicationMetadata =
    sanitizeApplicationMetadata(applicationMetadata);

  const questionsString = applicationQuestions
    .map((q, index) => `${index + 1}. ${q}`)
    .join('\n');

  return `Evaluate the following application based on the round metadata and project metadata:
  round: ${sanitizedRoundMetadata}, 
  project: ${sanitizedApplicationMetadata}

  Please answer the following questions to evaluate the application:
  ${questionsString}
  
  Please respond with ONLY the following JSON structure and NOTHING else:
  {
    "questions": [
      {
        "questionIndex": number, // index of the question from the provided list (starting from 0)
        "answerEnum": number // 0 for "yes", 1 for "no", 2 for "uncertain"
      },
      ...
    ],
    "summary": string // a brief summary of the evaluation
  }`;
};

export const createEvaluationQuestionPrompt = (
  roundMetadata: RoundMetadata
): string => {
  return `Given the following description of a Grants round, generate 5 evaluation questions that a reviewer can answer with 'Yes', 'No', or 'Uncertain'. The questions should help assess the projects in this round. Focus on key aspects such as alignment with the goals of the round. Ensure that each question is clear, concise, and can be answered with one of the three responses: 'Yes', 'No', or 'Uncertain'.

  Grants Round Description: ${sanitizeRoundMetadata(roundMetadata)}

  Examples of Evaluation Questions (These should be ignored while creating the new questions, and are only to be considered as examples of format):
  - This project must be open source.
  - Projects must conduct research that helps public goods.
  - Grant applications must direct funds to a multi-signature wallet.

  Return the evaluation questions as a string array.`;
};
