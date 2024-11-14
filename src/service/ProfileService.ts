import { profileRepository } from '@/repository';
import { type Application } from '@/entity/Application';
import { Profile } from '@/entity/Profile';
import { NotFoundError } from '@/errors';

class ProfileService {
  async createProfile(profileId: string): Promise<Profile> {
    const profile = new Profile();
    profile.profileId = profileId;
    return await profileRepository.save(profile);
  }

  async upsertProfile(profileId: string): Promise<Profile> {
    let profile = await profileRepository.findOne({
      where: { profileId },
    });

    if (profile == null) {
      profile = await this.createProfile(profileId);
    }
    return profile;
  }

  async getApplicationsByProfileId(profileId: string): Promise<Application[]> {
    const profile = await profileRepository.findOne({
      where: { profileId },
      relations: { applications: true },
    });

    if (profile != null) {
      return profile.applications;
    } else {
      throw new NotFoundError(`Profile with ID ${profileId} not found`);
    }
  }
}
const profileService = new ProfileService();
export default profileService;
