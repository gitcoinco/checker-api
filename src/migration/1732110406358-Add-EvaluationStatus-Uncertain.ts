import { type MigrationInterface, type QueryRunner } from "typeorm";

export class AddEvaluationStatusUncertain1732110406358 implements MigrationInterface {
    name = 'AddEvaluationStatusUncertain1732110406358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."evaluation_evaluationstatus_enum" RENAME TO "evaluation_evaluationstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."evaluation_evaluationstatus_enum" AS ENUM('approved', 'rejected', 'uncertain')`);
        await queryRunner.query(`ALTER TABLE "evaluation" ALTER COLUMN "evaluationStatus" TYPE "public"."evaluation_evaluationstatus_enum" USING "evaluationStatus"::"text"::"public"."evaluation_evaluationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."evaluation_evaluationstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."evaluation_evaluationstatus_enum_old" AS ENUM('approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "evaluation" ALTER COLUMN "evaluationStatus" TYPE "public"."evaluation_evaluationstatus_enum_old" USING "evaluationStatus"::"text"::"public"."evaluation_evaluationstatus_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."evaluation_evaluationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."evaluation_evaluationstatus_enum_old" RENAME TO "evaluation_evaluationstatus_enum"`);
    }

}
