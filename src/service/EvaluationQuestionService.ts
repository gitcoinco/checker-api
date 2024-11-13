import { type EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { evaluationQuestionRepository } from '@/repository';
import poolService from './PoolService';
import { NotFoundError } from '@/errors';

class EvaluationQuestionService {
  async createEvaluationQuestions(
    evaluationQuestions: Array<Partial<EvaluationQuestion>>
  ): Promise<EvaluationQuestion[]> {
    return await evaluationQuestionRepository.save(evaluationQuestions);
  }

  async deleteEvaluationQuestions(poolId: number): Promise<void> {
    await evaluationQuestionRepository.delete({ poolId });
  }

  async resetEvaluationQuestions(
    chainId: number,
    alloPoolId: string,
    evaluationQuestions: Array<Partial<EvaluationQuestion>>
  ): Promise<EvaluationQuestion[]> {
    const pool = await poolService.getPoolByPoolIdAndChainId(
      chainId,
      alloPoolId
    );
    if (pool == null) {
      throw new NotFoundError(
        `Pool not found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
      );
    }
    await this.deleteEvaluationQuestions(pool.id);
    return await this.createEvaluationQuestions(evaluationQuestions);
  }
}

const evaluationQuestionService = new EvaluationQuestionService();
export default evaluationQuestionService;
