import { applicationRepository } from '@/repository';
import { Application } from '@/entity/Application';
import profileService from './ProfileService';

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
    poolId: string,
    chainId: number
  ): Promise<Application[]> {
    const applications = await applicationRepository.find({
      where: {
        pool: { poolId },
        chainId,
      },
      relations: ['pool'],
    });
    return applications;
  }

  async upsertApplicationsForPool(
    poolId: string,
    chainId: number,
    applicationData: Array<{ applicationId: string; profileId: string }>
  ): Promise<Application[]> {
    const existingApplications = await this.getApplicationsByPoolId(
      poolId,
      chainId
    );
    const pool = existingApplications[0]?.pool;

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
}

const applicationService = new ApplicationService();
export default applicationService;
