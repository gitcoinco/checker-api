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

const sanitizeApplicationMetadata = (metadata: object): string => {
  return sanitizeAndReduceMetadata(metadata, essentialApplicationFields, 3000);
};
export const createAiEvaluationPrompt = (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata,
  applicationQuestions: PromptEvaluationQuestions
): string => {
  const sanitizedRoundMetadata = sanitizeRoundMetadata(roundMetadata);
  const sanitizedApplicationMetadata = sanitizeApplicationMetadata(
    applicationMetadata.application.project
  );

  const questionsString = applicationQuestions
    .map((q, index) => `${index + 1}. ${q}`)
    .join('\n');

  return `Evaluate the following application based on the round metadata and project metadata:
  round: ${sanitizedRoundMetadata}, 
  project: ${sanitizedApplicationMetadata}

  Please consider the following questions when evaluating the application and be very strict with your evaluation:
  ${questionsString}

  Your question answers should NOT be 'yes', 'no', or 'uncertain'. Please use always 0 for 'yes', 1 for 'no', and 2 for 'uncertain'.
    Please respond with ONLY the following JSON structure and NOTHING else:
    {
      "questions": [
        {
          "questionIndex": number, // index of the question from the provided list (IMPORTANT: starting from 0 to ${applicationQuestions.length - 1})
          "answerEnum": number, // VERY IMPORTANT: 0 for "yes", 1 for "no", 2 for "uncertain"
        },
        ...
      ],
      "summary": string // a detailed summary of the evaluation, including reasoning for 'yes', 'no', or 'uncertain' answers. Max 800 characters.
    }
  `;
};

export const createEvaluationQuestionPrompt = (
  roundMetadata: RoundMetadata
): string => {
  console.log('roundMetadata', roundMetadata);
  return `Given the following description of a Grants round, generate 5 evaluation questions that a reviewer can answer with 'Yes', 'No', or 'Uncertain'. The questions should help assess the projects in this round, focusing on the following key aspects:

    Ensure that each question is focused on one specific aspect of evaluation, is clear and concise, and can be answered with 'Yes', 'No', or 'Uncertain'. Also, avoid overly simplistic or binary questions unless they are critical for assessing eligibility. The questions should help a reviewer evaluate the project in a thoughtful, critical, and fair manner.

    Please create the questions based on the eligibility description and requirements of the round.

    Grants Round Description: ${sanitizeRoundMetadata(roundMetadata)}. 

    Return the evaluation questions as a string array.`;
};
