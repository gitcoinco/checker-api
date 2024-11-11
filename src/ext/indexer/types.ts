export type Address = `0x${string}`;

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Eligibility {
  description: string;
  requirements?: Array<{
    requirement?: string;
  }>;
}

export interface RoundMetadata {
  name: string;
  roundType: 'public' | 'private';
  eligibility: Eligibility;
  programContractAddress: string;
  support?: {
    info: string;
    type: string;
  };
}

export interface ProjectMetadata {
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  // credentials: ProjectCredentials;
  owners: Array<{ address: string }>;
  createdAt: number;
  lastUpdated: number;
}

export interface Application {
  id: string;
  chainId: string;
  roundId: string;
  round: {
    roundMetadata: RoundMetadata;
  };
  metadata: any;
  project: {
    metadata: ProjectMetadata;
  };
}
export interface RoundWithApplications {
  chainId: number;
  id: string;
  roundMetadata: RoundMetadata;
  roundMetadataCid: string;
  applications: Array<{
    id: string;
    metadata: ProjectMetadata;
    metadataCid: string;
    status: Status;
    project: {
      metadata: ProjectMetadata;
      metadataCid: string;
    };
  }>;
}

export interface RoundApplicationsQueryResponse {
  rounds: RoundWithApplications[];
}
