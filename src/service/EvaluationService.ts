import { type Evaluation, EVALUATOR_TYPE } from '@/entity/Evaluation';
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
  evaluatorType?: EVALUATOR_TYPE;
}

class EvaluationService {
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

    // Calculate the evaluator score
    let totalScore = 0;
    for (const question of questions) {
      totalScore += question.answerEnum;
    }

    // Normalize the score to be between 0 and 100
    const maxPossibleScore = questions.length * 2; // Each question can contribute a maximum of 2 points (uncertain)
    const evaluatorScore = Math.round(
      (1 - totalScore / maxPossibleScore) * 100
    );

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
