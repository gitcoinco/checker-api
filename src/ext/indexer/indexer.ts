import { createLogger } from '@/logger';
import type {
  RoundApplicationsQueryResponse,
  RoundWithApplications,
} from './types';
import request from 'graphql-request';
import { getRoundWithApplications } from './queries';
import type { Logger } from 'winston';

class Indexer {
  private static instance: Indexer | null = null;
  private readonly indexerEndpoint: string;
  private readonly logger: Logger;

  private constructor() {
    this.indexerEndpoint = process.env.INDEXER_URL ?? '';

    if (this.indexerEndpoint === '') {
      throw new Error('INDEXER_URL is not set');
    }

    if (this.indexerEndpoint.endsWith('/')) {
      this.indexerEndpoint = this.indexerEndpoint.slice(0, -1);
    }

    if (!this.indexerEndpoint.endsWith('/graphql')) {
      this.indexerEndpoint += '/graphql';
    }

    this.logger = createLogger('Indexer.ts');
  }

  public static getInstance(): Indexer {
    if (Indexer.instance === null) {
      Indexer.instance = new Indexer();
    }
    return Indexer.instance;
  }

  async getRoundWithApplications({
    chainId,
    roundId,
  }: {
    chainId: number;
    roundId: string;
  }): Promise<RoundWithApplications | null> {
    this.logger.debug(
      `Requesting round with applications for roundId: ${roundId}, chainId: ${chainId}`
    );

    const requestVariables = {
      chainId,
      roundId,
    };

    try {
      const response: RoundApplicationsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundWithApplications,
        requestVariables
      );

      if (response.rounds.length === 0) {
        this.logger.warn(
          `No round found for roundId: ${roundId} on chainId: ${chainId}`
        );
        return null;
      }

      const round = response.rounds[0];

      this.logger.info(
        `Successfully fetched round with ID: ${round.id}, which includes ${round.applications.length} applications`
      );
      return round;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round with applications: ${error.message}`,
        { error }
      );
      throw error;
    }
  }
}

export const indexer = Indexer.getInstance();
