import type { AnswerType, EvaluationAnswer } from '@/entity/EvaluationAnswer';
import { evaluationAnswerRepository } from '@/repository';

class EvaluationAnswerService {
  async createEvaluationAnswer(
    evaluationId: number,
    evaluationQuestionId: number,
    answer: AnswerType
  ): Promise<EvaluationAnswer> {
    const evaluationAnswer = evaluationAnswerRepository.create({
      evaluationId,
      evaluationQuestionId,
      answer,
    });

    return await evaluationAnswerRepository.save(evaluationAnswer);
  }
}

const evaluationAnswerService = new EvaluationAnswerService();
export default evaluationAnswerService;
