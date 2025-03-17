// 1. Basic Types & Enums
export type Address = `0x${string}`;

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// 2. Metadata & Supporting Interfaces
export interface ApplicationMetadata {
  signature: string;
  application: {
    round: string;
    answers: Array<{
      type: string;
      hidden: boolean;
      question: string;
      questionId: number;
      encryptedAnswer?: {
        ciphertext: string;
        encryptedSymmetricKey: string;
      };
    }>;
    project: ProjectMetadata;
    recipient: string;
  };
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
  owners: Array<{ address: string }>;
  createdAt: number;
  lastUpdated: number;
}

// 3. Base Interfaces (Used in Multiple Places)
export interface BaseProject {
  metadata: ProjectMetadata;
  metadataCid: string;
}

export interface BaseApplication {
  id: string;
  metadata: ApplicationMetadata;
  metadataCid: string;
  status: Status;
  projectId: string;
}

// 4. Extended Implementations
export interface Application extends BaseApplication {
  project: BaseProject;
}

export interface ApplicationQuery extends BaseApplication {
  projects: BaseProject[];
}

export interface BaseRound<T extends BaseApplication> {
  chainId: number;
  id: string;
  roundMetadata: RoundMetadata;
  roundMetadataCid: string;
  applications: T[];
}

export type RoundWithApplications = BaseRound<Application>;
export type RoundWithApplicationsQuery = BaseRound<ApplicationQuery>;

// 5. API Response Structures
export interface RoundApplicationsQueryResponse {
  rounds: RoundWithApplicationsQuery[];
}

export interface ApplicationWithRound {
  id: string;
  chainId: number;
  metadata: ApplicationMetadata;
  metadataCid: string;
  round: {
    id: string;
    roundMetadata: RoundMetadata;
  };
}

export interface ApplicationRoundQueryResponse {
  applications: ApplicationWithRound[];
}

export interface ManagerRolesResponse {
  rounds: Array<{
    roundRoles: Array<{
      address: string;
    }>;
  }>;
}
