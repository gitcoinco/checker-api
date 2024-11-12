import { type Evaluation } from '@/entity/Evaluation';
import { evaluationRepository } from '@/repository';

class EvaluationService {
  async createEvaluation(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    return await evaluationRepository.save(evaluation);
  }
}

const evaluationService = new EvaluationService();
export default evaluationService;
