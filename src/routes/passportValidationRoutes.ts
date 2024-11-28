import { validateSocialCredential } from '@/controllers/passportValidationController';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /passport/validate:
 *   post:
 *     summary: Validate a social credential
 *     description: Validates the social credentials (Twitter and GitHub) provided in the request body.
 *     tags:
 *       - Social Credential
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               application:
 *                 type: object
 *                 example:
 *                   {
 *                     "id": "2",
 *                     "projectId": "0x7f2586fce05d466c9fb3e509be56c02e0af6870f04209d5881c6d100534fec5d",
 *                     "chainId": 42161,
 *                     "roundId": "609",
 *                     "status": "REJECTED",
 *                     "metadataCid": "bafkreidtte6gasyfomd6w5krqtyxqzsgnxhsjcjxc4riywdy47jrkf6hum",
 *                     "metadata": {
 *                       "signature": "0x8e5ec2f393c8570cd4cf2d3990e15d51553b6d4ac025a0be49726407fc85d89d46194c7a22eddb52ec646f7399d15d82dd8b0dc9814f12a97607b674a4b7a6211c",
 *                       "application": {
 *                         "round": "0xd2d99614321becd7cd0636715bbb4c94968e6271",
 *                         "project": {
 *                           "id": "0x7f2586fce05d466c9fb3e509be56c02e0af6870f04209d5881c6d100534fec5d",
 *                           "title": "Synpress",
 *                           "logoImg": "bafkreibcxewuw2eddh7iiuea73ho4vxws7d3cpccr4slns7cbrpdo6q3he",
 *                           "metaPtr": {
 *                             "pointer": "bafkreifkskbvxlsbwqvg6ykf5upkpuhfyk5npilq7cwu2z5hf2p5hgpqsi",
 *                             "protocol": "undefined"
 *                           },
 *                           "website": "https://synpress.io",
 *                           "bannerImg": "bafkreiel7b3pblo44wnfogktgm23z6td7e5dmdy7lwzzy2diyp377aivgu",
 *                           "createdAt": 1691439308436,
 *                           "userGithub": "drptbl",
 *                           "credentials": {
 *                             "github": {
 *                               "type": ["VerifiableCredential"],
 *                               "proof": {
 *                                 "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..isd9NhS75ZO7slJtO-EsgJp4f6UAbgfqYBQQvwzNcNbONzLqBMNxGwnF9LmkFFgzP95NFRjqU4hoS2m0JSN_Ag",
 *                                 "type": "Ed25519Signature2018",
 *                                 "created": "2023-08-07T20:14:06.799Z",
 *                                 "proofPurpose": "assertionMethod",
 *                                 "verificationMethod": "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC#z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC"
 *                               },
 *                               "issuer": "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
 *                               "@context": ["https://www.w3.org/2018/credentials/v1"],
 *                               "issuanceDate": "2023-08-07T20:14:06.799Z",
 *                               "expirationDate": "2023-11-05T20:14:06.799Z",
 *                               "credentialSubject": {
 *                                 "id": "did:pkh:eip155:1:0xd35E119782059A27FEAd4EddA8B555f393650BC8",
 *                                 "hash": "v0.0.0:FEgJkAFXR+3d9wS6PNaaadDrlsmY9WN/gefBZK1JsBE=",
 *                                 "@context": [{"hash": "https://schema.org/Text", "provider": "https://schema.org/Text"}],
 *                                 "provider": "ClearTextGithubOrg#Synthetixio#8177587"
 *                               }
 *                             },
 *                             "twitter": {
 *                               "type": ["VerifiableCredential"],
 *                               "proof": {
 *                                 "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..6T3y5nFhOBk70U0eqNGsj1hSbKITUx0QwqF_-KXY2D1MIK37iCjWIlMldNdXXK_a4AiDNUQd6Ty_ppP5KH4hBQ",
 *                                 "type": "Ed25519Signature2018",
 *                                 "created": "2023-08-07T20:12:52.905Z",
 *                                 "proofPurpose": "assertionMethod",
 *                                 "verificationMethod": "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC#z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC"
 *                               },
 *                               "issuer": "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
 *                               "@context": ["https://www.w3.org/2018/credentials/v1"],
 *                               "issuanceDate": "2023-08-07T20:12:52.905Z",
 *                               "expirationDate": "2023-11-05T20:12:52.905Z",
 *                               "credentialSubject": {
 *                                 "id": "did:pkh:eip155:1:0xd35E119782059A27FEAd4EddA8B555f393650BC8",
 *                                 "hash": "v0.0.0:JPXYebm9ngO8o9AF40COv6w8V3+WvnP8oQd5iAhlp1w=",
 *                                 "@context": [{"hash": "https://schema.org/Text", "provider": "https://schema.org/Text"}],
 *                                 "provider": "ClearTextTwitter#Synpress_"
 *                               }
 *                             }
 *                           },
 *                           "description": "Synpress is an end-to-end testing framework for web applications based on Cypress and Playwright...",
 *                           "lastUpdated": 0,
 *                           "projectGithub": "Synthetixio",
 *                           "projectTwitter": "Synpress_"
 *                         },
 *                         "recipient": "0x7b57c388e6149b5c197B925037602d5B6bafFbCc"
 *                       }
 *                     },
 *                     "distributionTransaction": null,
 *                     "statusSnapshots": [
 *                       {
 *                         "status": "PENDING",
 *                         "updatedAt": "2024-09-30T22:01:48.000Z",
 *                         "updatedAtBlock": "259057447"
 *                       },
 *                       {
 *                         "status": "PENDING",
 *                         "updatedAt": "2024-10-09T18:12:27.000Z",
 *                         "updatedAtBlock": "262087357"
 *                       }
 *                     ],
 *                     "anchorAddress": "0x83ba0bd26a20a2c5f4e9157242b0c0ee659b7a2c",
 *                     "round": {
 *                       "strategyName": "allov2.DonationVotingMerkleDistributionDirectTransferStrategy",
 *                       "strategyAddress": "0xd2d99614321becd7cd0636715bbb4c94968e6271",
 *                       "roundMetadata": {
 *                         "name": "Beta Round"
 *                       },
 *                       "applicationsStartTime": "2024-09-30T12:00:00+00:00",
 *                       "applicationsEndTime": "2024-10-29T23:59:00+00:00",
 *                       "donationsEndTime": "2024-11-07T00:59:00+00:00",
 *                       "donationsStartTime": "2024-10-23T12:00:00+00:00"
 *                     },
 *                     "canonicalProject": {
 *                       "roles": [
 *                         {
 *                           "address": "0xd35e119782059a27fead4edda8b555f393650bc8"
 *                         }
 *                       ]
 *                     }
 *                   }
 *     responses:
 *       200:
 *         description: Social credentials validated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

router.post('/validate', validateSocialCredential);

export default router;
