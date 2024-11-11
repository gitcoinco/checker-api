import { profileRepository } from '@/repository';
import { type Application } from '@/entity/Application';

class ProfileService {
  async getApplicationsByProfileId(profileId: string): Promise<Application[]> {
    // Find the profile by profileId and load the applications relation
    const profile = await profileRepository.findOne({
      where: { profileId },
      relations: ['applications'],
    });

    if (profile != null) {
      return profile.applications;
    } else {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
  }
}
const profileService = new ProfileService();
export default profileService;
