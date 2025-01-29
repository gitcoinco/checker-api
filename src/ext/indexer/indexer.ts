import { createLogger } from '@/logger';
import type {
  RoundApplicationsQueryResponse,
  RoundWithApplications,
  ApplicationRoundQueryResponse,
  ApplicationWithRound,
  ManagerRolesResponse,
} from './types';
import request from 'graphql-request';
import {
  getRoundWithApplications,
  getApplicationWithRound,
  getRoundManager,
} from './queries';
import type { Logger } from 'winston';
import { IsNullError } from '@/errors';
import { env } from '@/env';
import LRUCache = require('lru-cache');

class IndexerClient {
  private static instance: IndexerClient | null = null;
  private readonly indexerEndpoint: string;
  private readonly logger: Logger;
  private readonly cache: LRUCache<string, any>;

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

    // Configure cache for 4GB RAM, 2 CPU system
    // Allocate ~20% of memory for caching (800MB)
    this.cache = new LRUCache({
      maxSize: 800 * 1024 * 1024, // 800MB max cache size
      sizeCalculation: (value, key) => {
        // Rough estimation of object size in bytes
        return JSON.stringify(value).length * 2;
      },
      ttl: 1000 * 60 * 5, // 5 minutes TTL for cache values
      updateAgeOnGet: true,
      allowStale: true, // Allow serving stale items while refreshing
    });
  }

  public static getInstance(): IndexerClient {
    if (IndexerClient.instance === null) {
      IndexerClient.instance = new IndexerClient();
    }
    return IndexerClient.instance;
  }

  private getCacheKey(method: string, params: object): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  async getRoundManager({
    chainId,
    alloPoolId,
  }: {
    chainId: number;
    alloPoolId: string;
  }): Promise<string[]> {
    this.logger.debug(
      `Requesting round manager for poolId: ${alloPoolId}, chainId: ${chainId}`
    );

    const requestVariables = {
      chainId,
      alloPoolId,
    };

    try {
      const response: ManagerRolesResponse = await request(
        this.indexerEndpoint,
        getRoundManager,
        requestVariables
      );

      if (response.rounds.length === 0) {
        this.logger.warn(
          `No round found for poolId: ${alloPoolId} on chainId: ${chainId}`
        );
        return [];
      }

      const round = response.rounds[0];

      if (round.roles.length === 0) {
        this.logger.warn(
          `No manager found for poolId: ${alloPoolId} on chainId: ${chainId}`
        );
        return [];
      }

      this.logger.info(`Successfully fetched round manager`);
      return round.roles.map(role => role.address);
    } catch (error) {
      this.logger.error(`Failed to fetch round manager: ${error.message}`, {
        error,
      });
      throw error;
    }
  }

  async getRoundWithApplications({
    chainId,
    roundId,
  }: {
    chainId: number;
    roundId: string;
  }): Promise<RoundWithApplications | null> {
    const cacheKey = this.getCacheKey('getRoundWithApplications', {
      chainId,
      roundId,
    });
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for round ${roundId}`);
      return JSON.parse(cached) as RoundWithApplications;
    } else {
      this.logger.debug(`Cache miss for round ${roundId}`);
    }

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

      // Cache the result
      this.cache.set(cacheKey, round);

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

  async getApplicationWithRound({
    chainId,
    roundId,
    applicationId,
  }: {
    chainId: number;
    roundId: string;
    applicationId: string;
  }): Promise<ApplicationWithRound | null> {
    const requestVariables = {
      chainId,
      roundId,
      applicationId,
    };

    try {
      const response: ApplicationRoundQueryResponse = await request(
        this.indexerEndpoint,
        getApplicationWithRound,
        requestVariables
      );

      const application = response.application;

      if (application == null) {
        this.logger.warn(
          `No application found for applicationId: ${applicationId} in roundId: ${roundId} on chainId: ${chainId}`
        );
        return null;
      }
      return response.application;
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
