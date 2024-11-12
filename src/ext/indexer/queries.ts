import { gql } from 'graphql-request';

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

export const getRoundWithSingleApplication = gql`
  query RoundApplication(
    $chainId: Int!
    $roundId: String!
    $applicationId: String!
  ) {
    rounds(
      filter: { chainId: { equalTo: $chainId }, id: { equalTo: $roundId } }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      applications(filter: { id: { equalTo: $applicationId } }) {
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
