import { gql } from 'graphql-request';

export const getApplication = gql`
  query Application(
    $chainId: Int!
    $applicationId: String!
    $roundId: String!
  ) {
    applications(
      first: 1
      condition: { chainId: $chainId, id: $applicationId, roundId: $roundId }
    ) {
      id
      chainId
      roundId
      round {
        roundMetadata
      }
      metadata
      project: canonicalProject {
        metadata
      }
    }
  }
`;
