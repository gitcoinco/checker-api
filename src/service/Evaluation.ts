import { type Evaluation, EVALUATOR_TYPE } from '@/entity/Evaluation';
import {
  applicationRepository,
  evaluationQuestionRepository,
  evaluationRepository,
} from '@/repository';
import { type AnswerType } from '@/entity/EvaluationAnswer';
import evaluationAnswerService from './EvaluationAnswerService';

interface EvaluationAnswerInput {
  questionIndex: number;
  answerEnum: AnswerType;
}

interface EvaluationSummaryInput {
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

    // Create the Evaluation
    const evaluation = await this.createEvaluation({
      evaluator,
      evaluatorType,
      summary,
      evaluatorScore: 0, // Calculate or set this as needed
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
        question.answerEnum
      );
    }

    return evaluation;
  }
}

const evaluationService = new EvaluationService();
export default evaluationService;
