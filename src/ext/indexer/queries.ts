import { gql } from 'graphql-request';

// export const getApplication = gql`
//   query Application(
//     $chainId: Int!
//     $applicationId: String!
//     $roundId: String!
//   ) {
//     applications(
//       first: 1
//       condition: { chainId: $chainId, id: $applicationId, roundId: $roundId }
//     ) {
//       id
//       chainId
//       roundId
//       round {
//         roundMetadata
//       }
//       metadata
//       project: canonicalProject {
//         metadata
//       }
//     }
//   }
// `;

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(
      filter: { chainId: { equalTo: $chainId }, id: { equalTo: $roundId } }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      applications {
        id
        metadata
        metadataCid
        status
        projectId
        project: canonicalProject {
          metadata
          metadataCid
        }
      }
    }
  }
`;
