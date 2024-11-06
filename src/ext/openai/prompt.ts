import type { Application, ProjectMetadata, RoundMetadata } from '../indexer';

export interface EvaluationResult {
  coolnessfactor: number;
  score: number;
  feedback: string;
}
const essentialProjectFields: Array<keyof ProjectMetadata> = [
  'title',
  'description',
  'website',
  'owners',
];

const sanitizeProjectMetadata = (metadata: ProjectMetadata): string => {
  const sanitizedMetadata = {};

  essentialProjectFields.forEach(field => {
    if (metadata[field] !== undefined) {
      sanitizedMetadata[field] = metadata[field];
    }
  });

  return JSON.stringify(sanitizedMetadata, null, 2);
};

const essentialRoundFields: Array<keyof RoundMetadata> = [
  'name',
  'roundType',
  'eligibility',
];

const sanitizeRoundMetadata = (metadata: RoundMetadata): string => {
  const sanitizedMetadata = {};

  essentialRoundFields.forEach(field => {
    if (metadata[field] !== undefined) {
      sanitizedMetadata[field] = metadata[field];
    }
  });

  return JSON.stringify(sanitizedMetadata, null, 2);
};

export const createPrompt = (application: Application): string => {
  const sanitizedRoundMetadata = sanitizeRoundMetadata(
    application.round.roundMetadata
  );
  const sanitizedProjectMetadata = sanitizeProjectMetadata(
    application.project.metadata
  );

  return `Evaluate the following application based on the round metadata and project metadata:
  round: ${sanitizedRoundMetadata}, 
  project: ${sanitizedProjectMetadata}
  
  Please respond with ONLY the following JSON structure and NOTHING else:
  {
    "coolnessfactor": number, // a number between 0 and 100
    "score": number, // a number between 0 and 100
    "feedback": string
  }`;
};
