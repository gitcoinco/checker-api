import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddIndexes1738025911271 implements MigrationInterface {
    name = 'AddIndexes1738025911271'
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Indexes for Pool lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_pool_chain_allo_pool 
            ON "pool"("chainId", "alloPoolId");
        `);

        // Indexes for Application lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_application_pool_chain 
            ON "application"("poolId", "chainId");
            
            CREATE INDEX IF NOT EXISTS idx_application_allo_id 
            ON "application"("alloApplicationId");
        `);

        // Indexes for Evaluation lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_evaluation_application 
            ON "evaluation"("applicationId");
            
            CREATE INDEX IF NOT EXISTS idx_evaluation_evaluator 
            ON "evaluation"("evaluator", "evaluatorType");
            
            CREATE INDEX IF NOT EXISTS idx_evaluation_status 
            ON "evaluation"("evaluationStatus");
        `);

        // Indexes for EvaluationQuestion lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_eval_question_pool 
            ON "evaluation_question"("poolId", "questionIndex");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_pool_chain_allo_pool`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_application_pool_chain`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_application_allo_id`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_evaluation_application`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_evaluation_evaluator`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_evaluation_status`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_eval_question_pool`);
    }
} 