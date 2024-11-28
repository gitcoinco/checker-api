import { validateSocialCredential } from '@/controllers/passportValidationController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /passport/validate:
 *   post:
 *     summary: Validate a social credential
 *     description: Validates the social credential provided in the request body.
 *     tags:
 *       - Social Credential
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 example: "twitter"
 *               application:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   projectId:
 *                     type: string
 *                   chainId:
 *                     type: number
 *                   roundId:
 *                     type: string
 *                   status:
 *                     type: string
 *                   metadataCid:
 *                     type: string
 *                   metadata:
 *                     type: object
 *                     properties:
 *                       signature:
 *                         type: string
 *                       application:
 *                         type: object
 *                         properties:
 *                           round:
 *                             type: string
 *                           answers:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 type:
 *                                   type: string
 *                                 hidden:
 *                                   type: boolean
 *                                 question:
 *                                   type: string
 *                                 questionId:
 *                                   type: number
 *                                 encryptedAnswer:
 *                                   type: object
 *                                   properties:
 *                                     ciphertext:
 *                                       type: string
 *                                     encryptedSymmetricKey:
 *                                       type: string
 *                                 answer:
 *                                   type: string
 *                           project:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               logoImg:
 *                                 type: string
 *                               metaPtr:
 *                                 type: object
 *                                 properties:
 *                                   pointer:
 *                                     type: string
 *                                   protocol:
 *                                     type: string
 *                               website:
 *                                 type: string
 *                               bannerImg:
 *                                 type: string
 *                               createdAt:
 *                                 type: number
 *                               userGithub:
 *                                 type: string
 *                               credentials:
 *                                 type: object
 *                                 properties:
 *                                   github:
 *                                     type: object
 *                                     properties:
 *                                       type:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       proof:
 *                                         type: object
 *                                         properties:
 *                                           jws:
 *                                             type: string
 *                                           type:
 *                                             type: string
 *                                           created:
 *                                             type: string
 *                                           proofPurpose:
 *                                             type: string
 *                                           verificationMethod:
 *                                             type: string
 *                                       issuer:
 *                                         type: string
 *                                       "@context":
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       issuanceDate:
 *                                         type: string
 *                                       expirationDate:
 *                                         type: string
 *                                       credentialSubject:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: string
 *                                           hash:
 *                                             type: string
 *                                           "@context":
 *                                             type: array
 *                                             items:
 *                                               type: object
 *                                               properties:
 *                                                 hash:
 *                                                   type: string
 *                                                 provider:
 *                                                   type: string
 *                                   twitter:
 *                                     type: object
 *                                     properties:
 *                                       type:
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       proof:
 *                                         type: object
 *                                         properties:
 *                                           jws:
 *                                             type: string
 *                                           type:
 *                                             type: string
 *                                           created:
 *                                             type: string
 *                                           proofPurpose:
 *                                             type: string
 *                                           verificationMethod:
 *                                             type: string
 *                                       issuer:
 *                                         type: string
 *                                       "@context":
 *                                         type: array
 *                                         items:
 *                                           type: string
 *                                       issuanceDate:
 *                                         type: string
 *                                       expirationDate:
 *                                         type: string
 *                                       credentialSubject:
 *                                         type: object
 *                                         properties:
 *                                           id:
 *                                             type: string
 *                                           hash:
 *                                             type: string
 *                                           "@context":
 *                                             type: array
 *                                             items:
 *                                               type: object
 *                                               properties:
 *                                                 hash:
 *                                                   type: string
 *                                                 provider:
 *                                                   type: string
 *                   distributionTransaction:
 *                     type: object
 *                   statusSnapshots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                         updatedAtBlock:
 *                           type: string
 *                   anchorAddress:
 *                     type: string
 *                   round:
 *                     type: object
 *                     properties:
 *                       strategyName:
 *                         type: string
 *                       strategyAddress:
 *                         type: string
 *                       roundMetadata:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       applicationsStartTime:
 *                         type: string
 *                       applicationsEndTime:
 *                         type: string
 *                       donationsEndTime:
 *                         type: string
 *                       donationsStartTime:
 *                         type: string
 *                   canonicalProject:
 *                     type: object
 *                     properties:
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *     responses:
 *       200:
 *         description: Social credential validated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Social credential validated"
 *                 verified:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/validate', validateSocialCredential);

export default router;
