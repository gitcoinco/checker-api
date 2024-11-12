import type { ApplicationMetadata, RoundMetadata } from '../indexer';

export interface PromptEvaluationResult {
  score: number;
  feedback: string;
}

export type PromptEvaluationQuestions = string[];

// const essentialProjectFields: Array<keyof ProjectMetadata> = [
//   'title',
//   'description',
//   'website',
//   'owners',
// ];

const essentialRoundFields: Array<keyof RoundMetadata> = [
  'name',
  'roundType',
  'eligibility',
];

const essentialApplicationFields: Array<keyof ApplicationMetadata> = [
  'application',
];

// const sanitizeProjectMetadata = (metadata: ProjectMetadata): string => {
//   const sanitizedMetadata = {};

//   essentialProjectFields.forEach(field => {
//     if (metadata[field] !== undefined) {
//       sanitizedMetadata[field] = metadata[field];
//     }
//   });

//   return JSON.stringify(sanitizedMetadata, null, 2);
// };

const sanitizeRoundMetadata = (metadata: RoundMetadata): string => {
  const sanitizedMetadata = {};

  essentialRoundFields.forEach(field => {
    if (metadata[field] !== undefined) {
      sanitizedMetadata[field] = metadata[field];
    }
  });

  return JSON.stringify(sanitizedMetadata, null, 2);
};

const sanitizeApplicationMetadata = (metadata: ApplicationMetadata): string => {
  const sanitizedApplicationMetadata = {};

  essentialApplicationFields.forEach(field => {
    if (metadata[field] !== undefined) {
      sanitizedApplicationMetadata[field] = metadata[field];
    }
  });

  return JSON.stringify(sanitizedApplicationMetadata, null, 2);
};

export const createAiEvaluationPrompt = (
  roundMetadata: RoundMetadata,
  applicationMetadata: ApplicationMetadata
): string => {
  const sanitizedRoundMetadata = sanitizeRoundMetadata(roundMetadata);
  const sanitizedApplicationMetadata =
    sanitizeApplicationMetadata(applicationMetadata);

  return `Evaluate the following application based on the round metadata and project metadata:
  round: ${sanitizedRoundMetadata}, 
  project: ${sanitizedApplicationMetadata}
  
  Please respond with ONLY the following JSON structure and NOTHING else:
  {
    "score": number, // a number between 0 and 100
    "feedback": string
  }`;
};

export const createEvaluationQuestionPrompt = (
  roundMetadata: RoundMetadata
): string => {
  return `Given the following description of a Gitcoin Grants round, generate 5 evaluation questions that a reviewer can answer with 'Yes', 'No', or 'Uncertain'. The questions should help assess the projects in this round. Focus on key aspects such as project impact, feasibility, team capabilities, and alignment with the goals of the round. Ensure that each question is clear, concise, and can be answered with one of the three responses: 'Yes', 'No', or 'Uncertain'.

  Gitcoin Round Description: ${sanitizeRoundMetadata(roundMetadata)}

  Examples of Evaluation Questions (These should be ignored while creating the new questions, and are only to be considered as examples of format):
  - This project must be open source.
  - Projects must conduct research that helps public goods.
  - Grant applications must direct funds to a multi-signature wallet.

  Return the evaluation questions as a string array.`;
};
