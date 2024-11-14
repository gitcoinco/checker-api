import { evaluateApplication } from '@/controllers/evaluationController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /evaluate:
 *   post:
 *     summary: "Evaluate an application"
 *     description: "This endpoint is used to evaluate an application by providing evaluation questions and answers."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               poolId:
 *                 type: string
 *                 example: "609"
 *               applicationId:
 *                 type: string
 *                 example: "app123"
 *               evaluator:
 *                 type: string
 *                 example: "0x12345abcdef67890"
 *               cid:
 *                 type: string
 *                 example: "cid1234567890"
 *               summaryInput:
 *                 type: object
 *                 properties:
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         questionIndex:
 *                           type: integer
 *                           example: 0
 *                         answerEnum:
 *                           type: integer
 *                           example: 1
 *                   summary:
 *                     type: string
 *                     example: "The application is well-rounded, but some aspects need improvement."
 *               chainId:
 *                 type: integer
 *                 example: 42161
 *             example:
 *               poolId: "609"
 *               applicationId: "0"
 *               evaluator: "0x12345abcdef67890"
 *               cid: "cid1234567890"
 *               summaryInput:
 *                 questions:
 *                   - questionIndex: 0
 *                     answerEnum: 0
 *                   - questionIndex: 1
 *                     answerEnum: 1
 *                   - questionIndex: 2
 *                     answerEnum: 0
 *                   - questionIndex: 3
 *                     answerEnum: 2
 *                   - questionIndex: 4
 *                     answerEnum: 2
 *                 summary: "The application is well-rounded, but some aspects need improvement."
 *               chainId: 42161
 *     responses:
 *       200:
 *         description: "Evaluation successfully created"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evaluation successfully created"
 *                 evaluationId:
 *                   type: string
 *                   example: "eval123456"
 *       404:
 *         description: "Application or Pool not found"
 *       500:
 *         description: "Internal Server Error"
 */
router.post('/', evaluateApplication);

export default router;
