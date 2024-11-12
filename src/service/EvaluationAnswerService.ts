import { type EvaluationAnswer } from '@/entity/EvaluationAnswer';
import { evaluationAnswerRepository } from '@/repository';

class EvaluationAnswerService {
  async createEvaluationAnswers(
    evaluationAnswers: Array<Partial<EvaluationAnswer>>
  ): Promise<EvaluationAnswer[]> {
    return await evaluationAnswerRepository.save(evaluationAnswers);
  }
}

const evaluationAnswerService = new EvaluationAnswerService();
export default evaluationAnswerService;
