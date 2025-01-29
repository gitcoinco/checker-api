import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddPerformanceIndexes1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Indexes for Pool lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_pool_chain_allo_pool 
            ON pool(chain_id, allo_pool_id);
        `);

        // Indexes for Application lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_application_pool_chain 
            ON application(pool_id, chain_id);
            
            CREATE INDEX IF NOT EXISTS idx_application_allo_id 
            ON application(allo_application_id);
        `);

        // Indexes for Evaluation lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_evaluation_application 
            ON evaluation(application_id);
            
            CREATE INDEX IF NOT EXISTS idx_evaluation_evaluator 
            ON evaluation(evaluator, evaluator_type);
            
            CREATE INDEX IF NOT EXISTS idx_evaluation_status 
            ON evaluation(evaluation_status);
        `);

        // Indexes for EvaluationQuestion lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_eval_question_pool 
            ON evaluation_question(pool_id, question_index);
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