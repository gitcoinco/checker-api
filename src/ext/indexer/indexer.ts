import { createLogger } from '@/logger';
import type {
  RoundApplicationsQueryResponse,
  RoundWithApplications,
  RoundApplicationQueryResponse,
  RoundWithSingleApplication,
} from './types';
import request from 'graphql-request';
import {
  getRoundWithApplications,
  getRoundWithSingleApplication,
} from './queries';
import type { Logger } from 'winston';
import { IsNullError } from '@/errors';
import { env } from '@/env';

class IndexerClient {
  private static instance: IndexerClient | null = null;
  private readonly indexerEndpoint: string;
  private readonly logger: Logger;

  private constructor() {
    this.indexerEndpoint = env.INDEXER_URL ?? '';

    if (this.indexerEndpoint === '') {
      throw new IsNullError('INDEXER_URL is not set');
    }

    if (this.indexerEndpoint.endsWith('/')) {
      this.indexerEndpoint = this.indexerEndpoint.slice(0, -1);
    }

    if (!this.indexerEndpoint.endsWith('/graphql')) {
      this.indexerEndpoint += '/graphql';
    }

    this.logger = createLogger('Indexer.ts');
  }

  public static getInstance(): IndexerClient {
    if (IndexerClient.instance === null) {
      IndexerClient.instance = new IndexerClient();
    }
    return IndexerClient.instance;
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

  async getRoundWithSingleApplication({
    chainId,
    roundId,
    applicationId,
  }: {
    chainId: number;
    roundId: string;
    applicationId: string;
  }): Promise<RoundWithSingleApplication | null> {
    this.logger.debug(
      `Requesting round with single application for roundId: ${roundId}, chainId: ${chainId}, applicationId: ${applicationId}`
    );

    const requestVariables = {
      chainId,
      roundId,
      applicationId,
    };

    try {
      const response: RoundApplicationQueryResponse = await request(
        this.indexerEndpoint,
        getRoundWithSingleApplication,
        requestVariables
      );

      if (
        response.rounds.length === 0 ||
        response.rounds[0].applications.length === 0
      ) {
        this.logger.warn(
          `No application found for applicationId: ${applicationId} in roundId: ${roundId} on chainId: ${chainId}`
        );
        return null;
      }

      const round = response.rounds[0];

      this.logger.info(
        `Successfully fetched round with ID: ${round.id}, which includes the application with ID: ${applicationId}`
      );
      return round;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round with single application: ${error.message}`,
        { error }
      );
      throw error;
    }
  }
}

export const indexerClient = IndexerClient.getInstance();
