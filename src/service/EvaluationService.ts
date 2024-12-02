import {
  type Evaluation,
  EVALUATION_STATUS,
  EVALUATOR_TYPE,
} from '@/entity/Evaluation';
import {
  evaluationQuestionRepository,
  evaluationRepository,
} from '@/repository';
import { toAnswerType } from '@/entity/EvaluationAnswer';
import evaluationAnswerService from './EvaluationAnswerService';
import { type PromptEvaluationQuestions } from '@/ext/openai';
import { NotFoundError } from '@/errors';
import applicationService from './ApplicationService';
import evaluationQuestionService from './EvaluationQuestionService';

interface EvaluationAnswerInput {
  questionIndex: number;
  answerEnum: number;
}

export interface EvaluationSummaryInput {
  questions: EvaluationAnswerInput[];
  summary: string;
}

export interface CreateEvaluationParams {
  chainId: number;
  alloPoolId: string;
  alloApplicationId: string;
  cid: string;
  evaluator: string;
  summaryInput: EvaluationSummaryInput;
  evaluationStatus?: EVALUATION_STATUS;
  evaluatorType?: EVALUATOR_TYPE;
}

class EvaluationService {
  async cleanEvaluations(): Promise<void> {
    const evaluationsWithoutAnswers = await evaluationRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.evaluationAnswer', 'evaluationAnswer')
      .where('evaluationAnswer.id IS NULL')
      .getMany();

    if (evaluationsWithoutAnswers.length > 0) {
      await evaluationRepository.remove(evaluationsWithoutAnswers);
    }
  }

  async createEvaluation(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    if (evaluation.evaluator != null && evaluation.applicationId != null) {
      await this.deleteExistingEvaluationByEvaluatorAndApplicationId(
        evaluation.evaluator,
        evaluation.applicationId
      );
    }
    return await evaluationRepository.save(evaluation);
  }

  async deleteExistingEvaluationByEvaluatorAndApplicationId(
    evaluator: string,
    applicationId: number
  ): Promise<void> {
    await evaluationRepository.delete({
      evaluator,
      applicationId,
    });
  }

  async createEvaluationWithAnswers({
    chainId,
    alloPoolId,
    alloApplicationId,
    cid,
    evaluator,
    summaryInput,
    evaluationStatus = EVALUATION_STATUS.REJECTED,
    evaluatorType = EVALUATOR_TYPE.HUMAN,
  }: CreateEvaluationParams): Promise<Evaluation> {
    const { questions, summary } = summaryInput;

    const application =
      await applicationService.getApplicationByAlloPoolIdAndAlloApplicationId(
        alloPoolId,
        chainId,
        alloApplicationId
      );

    if (application == null) {
      throw new NotFoundError('Application not found');
    }

    let totalScore = 0;
    for (const question of questions) {
      if (question.answerEnum === 0) {
        // approved
        totalScore += 1;
      } else if (question.answerEnum === 2) {
        // uncertain
        totalScore += 0.5;
      }
    }

    // Calculate the maximum possible score
    const maxPossibleScore = questions.length;

    // Calculate the evaluator score as a percentage
    const evaluatorScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Set the evaluation status if the evaluator is not human
    if (evaluatorType !== EVALUATOR_TYPE.HUMAN) {
      if (evaluatorScore < 40) {
        evaluationStatus = EVALUATION_STATUS.REJECTED;
      } else if (evaluatorScore > 60) {
        evaluationStatus = EVALUATION_STATUS.APPROVED;
      } else {
        evaluationStatus = EVALUATION_STATUS.UNCERTAIN;
      }
    }

    // Create the Evaluation
    const evaluation = await this.createEvaluation({
      evaluator,
      evaluatorType,
      summary,
      evaluatorScore,
      evaluationStatus,
      metadataCid: cid,
      applicationId: application.id,
      application,
    });

    for (const question of questions) {
      const evaluationQuestion =
        await evaluationQuestionService.getEvaluationQuestionsByAlloPoolIdAndQuestionIndex(
          alloPoolId,
          chainId,
          question.questionIndex
        );

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

  /**
   * Fetches all questions for a given chainId and alloPoolId.
   * @param chainId - The chainId of the pool.
   * @param alloPoolId - The alloPoolId of the pool.
   * @returns An array of questions as strings.
   */
  getQuestionsByChainAndAlloPoolId = async (
    chainId: number,
    alloPoolId: string
  ): Promise<PromptEvaluationQuestions> => {
    const questions = await evaluationQuestionRepository.find({
      where: {
        pool: { alloPoolId, chainId },
      },
      relations: ['pool'],
      order: {
        questionIndex: 'ASC',
      },
    });

    return questions.map(question => question.question);
  };
}

const evaluationService = new EvaluationService();
export default evaluationService;
