import { createLogger } from '@/logger';
import type { Application } from './types';
import request from 'graphql-request';
import { getApplication } from './queries';
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

  async getApplication({
    roundId,
    chainId,
    applicationId,
  }: {
    roundId: string;
    chainId: number;
    applicationId: string;
  }): Promise<Application | null> {
    this.logger.debug(
      `Requesting approved application for roundId: ${roundId}, chainId: ${chainId}, applicationId: ${applicationId}`
    );

    const requestVariables = {
      roundId,
      chainId,
      applicationId,
    };

    try {
      const response: { applications: Application[] } = await request(
        this.indexerEndpoint,
        getApplication,
        requestVariables
      );

      if (response.applications.length === 0) {
        this.logger.warn(`No approved applications found for ${applicationId}`);
        return null;
      }

      this.logger.info(
        `Successfully fetched approved application with ID: ${response.applications[0].id}`
      );
      return response.applications[0];
    } catch (error) {
      this.logger.error(
        `Failed to fetch approved application: ${error.message}`,
        { error }
      );
      throw error;
    }
  }
}

export const indexer = Indexer.getInstance();
