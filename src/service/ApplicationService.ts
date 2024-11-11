import { applicationRepository } from '@/repository';
import { type Application } from '@/entity/Application';

class ApplicationService {
  async createApplication(application: Application): Promise<Application> {
    return await applicationRepository.save(application);
  }

  async createApplications(
    applications: Application[]
  ): Promise<Application[]> {
    return await applicationRepository.save(applications);
  }
}

const applicationService = new ApplicationService();
export default applicationService;
