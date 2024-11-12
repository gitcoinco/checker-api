import { type Evaluation, EVALUATOR_TYPE } from '@/entity/Evaluation';
import {
  applicationRepository,
  evaluationQuestionRepository,
  evaluationRepository,
} from '@/repository';
import { toAnswerType } from '@/entity/EvaluationAnswer';
import evaluationAnswerService from './EvaluationAnswerService';

interface EvaluationAnswerInput {
  questionIndex: number;
  answerEnum: number;
}

export interface EvaluationSummaryInput {
  questions: EvaluationAnswerInput[];
  summary: string;
}

class EvaluationService {
  async createEvaluation(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    return await evaluationRepository.save(evaluation);
  }

  async createEvaluationWithAnswers(
    poolId: number,
    applicationId: string,
    cid: string,
    evaluator: string,
    summaryInput: EvaluationSummaryInput,
    evaluatorType: EVALUATOR_TYPE = EVALUATOR_TYPE.HUMAN
  ): Promise<Evaluation> {
    const { questions, summary } = summaryInput;

    const application = await applicationRepository.findOne({
      where: { poolId, applicationId },
    });

    if (application == null) {
      throw new Error('Application not found');
    }

    // Calculate the evaluator score
    let totalScore = 0;
    for (const question of questions) {
      totalScore += question.answerEnum;
    }

    // Normalize the score to be between 0 and 100
    const maxPossibleScore = questions.length * 2; // Each question can contribute a maximum of 2 points (uncertain)
    const evaluatorScore = (1 - totalScore / maxPossibleScore) * 100;

    // Create the Evaluation
    const evaluation = await this.createEvaluation({
      evaluator,
      evaluatorType,
      summary,
      evaluatorScore,
      metadataCid: cid,
      applicationId: application.id,
      application,
    });

    for (const question of questions) {
      const evaluationQuestion = await evaluationQuestionRepository.findOne({
        where: { poolId, questionIndex: question.questionIndex },
      });

      if (evaluationQuestion == null) {
        throw new Error(
          `EvaluationQuestion not found for index ${question.questionIndex}`
        );
      }

      await evaluationAnswerService.createEvaluationAnswer(
        evaluation.id,
        evaluationQuestion.id,
        toAnswerType(question.answerEnum)
      );
    }

    return evaluation;
  }
}

const evaluationService = new EvaluationService();
export default evaluationService;
