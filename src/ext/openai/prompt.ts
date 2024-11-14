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

    Ensure that the project and application are not spam or scams and that the project looks legitimate. Please consider all available evidence and reasoning to assess legitimacy carefully. Avoid answering "yes" to all questions unless there is strong justification.

    Please respond with ONLY the following JSON structure and NOTHING else:
    {
      "questions": [
        {
          "questionIndex": number, // index of the question from the provided list (starting from 0)
          "answerEnum": number, // 0 for "yes", 1 for "no", 2 for "uncertain"
        },
        ...
      ],
      "summary": string // a detailed summary of the evaluation, including reasoning for 'yes', 'no', or 'uncertain' answers.
    }
  `;
};

export const createEvaluationQuestionPrompt = (
  roundMetadata: RoundMetadata
): string => {
  return `Given the following description of a Grants round, generate 5 evaluation questions that a reviewer can answer with 'Yes', 'No', or 'Uncertain'. The questions should help assess the projects in this round, focusing on the following key aspects:

    - **Legitimacy**: Does the project demonstrate trustworthiness, transparency, or verifiable sources?
    - **Alignment with Round Goals**: Does the project align with the specific goals and objectives of the round as described in the metadata?
    - **Feasibility and Sustainability**: Is the project feasible and sustainable over time? Does it have a realistic plan for implementation and long-term success?
    - **Impact**: Will the project have a measurable, positive impact on the target community or cause?
    - **Sustainability**: Does the project have a plan for continued success or impact after the initial grant funding ends?

    Ensure that each question is focused on one specific aspect of evaluation, is clear and concise, and can be answered with 'Yes', 'No', or 'Uncertain'. Also, avoid overly simplistic or binary questions unless they are critical for assessing eligibility. The questions should help a reviewer evaluate the project in a thoughtful, critical, and fair manner.

    Grants Round Description: ${sanitizeRoundMetadata(roundMetadata)}

    Examples of Evaluation Questions (These should be ignored while creating the new questions, and are only to be considered as examples of format):
    - Does the project have a clear and actionable plan for achieving its goals?
    - Is there any evidence of the project's legitimacy, such as an established team or verifiable partners?
    - Will the project have a measurable impact on the community it aims to serve?
    - Does the project have a strategy for maintaining its impact over the long term?

    Return the evaluation questions as a string array.`;
};
