import { SavedJobRepository } from "../repositories/savedJobRepository.js";
import type { SavedJob } from "../types/savedJob.js";

export class SavedJobService {
  private repository: SavedJobRepository;

  constructor(tableName: string) {
    this.repository = new SavedJobRepository(tableName);
  }

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    console.log(`Saving job ${jobId} for user ${userId}`);
    const savedJob = await this.repository.save(userId, jobId);
    console.log(`Job ${jobId} saved successfully for user ${userId}`);
    return savedJob;
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    console.log(`Removing saved job ${jobId} for user ${userId}`);
    await this.repository.remove(userId, jobId);
    console.log(`Job ${jobId} removed from saved jobs for user ${userId}`);
  }

  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    console.log(`Fetching saved jobs for user ${userId}`);
    const savedJobs = await this.repository.findByUserId(userId);
    console.log(`Found ${savedJobs.length} saved jobs for user ${userId}`);
    return savedJobs;
  }
}
