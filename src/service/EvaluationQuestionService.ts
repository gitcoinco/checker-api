import { type EvaluationQuestion } from '@/entity/EvaluationQuestion';
import { evaluationQuestionRepository } from '@/repository';

class EvaluationQuestionService {
  async createEvaluationQuestions(
    evaluationQuestions: EvaluationQuestion[]
  ): Promise<EvaluationQuestion[]> {
    return await evaluationQuestionRepository.save(evaluationQuestions);
  }
}

const evaluationQuestionService = new EvaluationQuestionService();
export default evaluationQuestionService;
