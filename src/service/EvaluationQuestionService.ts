import { EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { evaluationQuestionRepository } from '@/repository';
import poolService from './PoolService';
import { type PromptEvaluationQuestions } from '@/ext/openai';

class EvaluationQuestionService {
  async createEvaluationQuestions(
    evaluationQuestions: Array<Partial<EvaluationQuestion>>
  ): Promise<EvaluationQuestion[]> {
    return await evaluationQuestionRepository.save(evaluationQuestions);
  }

  async deleteEvaluationQuestions(poolId: number): Promise<void> {
    // TODO: revert if evaluation question is already present
    await evaluationQuestionRepository.delete({ poolId });
  }

  async resetEvaluationQuestions(
    chainId: number,
    alloPoolId: string,
    questions: PromptEvaluationQuestions
  ): Promise<EvaluationQuestion[]> {
    const pool = await poolService.getPoolByChainIdAndAlloPoolId(
      chainId,
      alloPoolId
    );
    if (pool == null) {
      throw new Error(
        `Pool not found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
      );
    }
    await this.deleteEvaluationQuestions(pool.id);

    const evaluationQuestions = questions.map((question, index) => {
      const evaluationQuestion = new EvaluationQuestion();
      evaluationQuestion.pool = pool;
      evaluationQuestion.question = question;
      evaluationQuestion.questionIndex = index;
      evaluationQuestion.poolId = pool.id;

      return evaluationQuestion;
    });

    return await this.createEvaluationQuestions(evaluationQuestions);
  }
}

const evaluationQuestionService = new EvaluationQuestionService();
export default evaluationQuestionService;
