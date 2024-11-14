import { applicationRepository } from '@/repository';
import { Application } from '@/entity/Application';
import profileService from './ProfileService';
import poolService from './PoolService';
import { In } from 'typeorm';
import { NotFoundError } from '@/errors';

class ApplicationService {
  async createApplication(
    application: Partial<Application>
  ): Promise<Application> {
    return await applicationRepository.save(application);
  }

  async createApplications(
    applications: Array<Partial<Application>>
  ): Promise<Application[]> {
    return await applicationRepository.save(applications);
  }

  async getApplicationsByPoolId(
    alloPoolId: string,
    chainId: number
  ): Promise<Application[]> {
    const applications = await applicationRepository.find({
      where: {
        pool: { alloPoolId },
        chainId,
      },
      relations: { pool: true },
    });
    return applications;
  }

  async upsertApplicationsForPool(
    alloPoolId: string,
    chainId: number,
    applicationData: Array<{ applicationId: string; profileId: string }>
  ): Promise<Application[]> {
    const existingApplications = await this.getApplicationsByPoolId(
      alloPoolId,
      chainId
    );

    const pool = await poolService.getPoolByChainIdAndAlloPoolId(
      chainId,
      alloPoolId
    );
    if (pool == null) {
      throw new NotFoundError(
        `Pool not found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
      );
    }

    const newApplications = await Promise.all(
      applicationData
        .filter(
          ({ applicationId }) =>
            !existingApplications.some(
              existingApplication =>
                existingApplication.applicationId === applicationId
            )
        )
        .map(async ({ applicationId, profileId }) => {
          // Ensure profile is upserted
          const profile = await profileService.upsertProfile(profileId);

          // Instantiate a new Application entity
          const application = new Application();
          application.chainId = chainId;
          application.applicationId = applicationId;
          application.pool = pool;
          application.profile = profile;
          application.evaluations = []; // Empty array for now
          application.poolId = pool.id;

          // Return the new Application entity
          return application;
        })
    );

    return await this.createApplications(newApplications);
  }

  async getEvaluationsByPoolId(
    alloPoolId: string,
    chainId: number
  ): Promise<Application[]> {
    const applications = await this.getApplicationsByPoolId(
      alloPoolId,
      chainId
    );
    return applications;
  }

  async getApplicationByChainIdPoolIdApplicationId(
    alloPoolId: string,
    chainId: number,
    applicationId: string
  ): Promise<Application | null> {
    const application = await applicationRepository.findOne({
      where: {
        pool: { alloPoolId },
        chainId,
        applicationId,
      },
      relations: ['pool'],
    });

    return application;
  }

  async getApplicationsByChainIdPoolIdApplicationIds(
    alloPoolId: string,
    chainId: number,
    applicationIdArray: string[]
  ): Promise<Application[]> {
    const applications = await applicationRepository.find({
      where: {
        pool: { alloPoolId },
        chainId,
        applicationId: In(applicationIdArray),
      },
      relations: ['pool'],
    });

    return applications;
  }
}

const applicationService = new ApplicationService();
export default applicationService;
