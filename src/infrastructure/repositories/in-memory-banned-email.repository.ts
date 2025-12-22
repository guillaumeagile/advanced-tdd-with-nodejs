import { BannedEmailRepository } from '../../domain/ports/banned-email.repository.js';

/**
 * MockBannedEmailRepository - Test Double
 *
 * This mock implementation is used for unit testing.
 * It stores banned emails in memory and allows test control.
 *
 * Use this for:
 * - Unit tests of ValkeyAntiSpamAdapter
 * - Tests where you don't need real Valkey
 * - Fast test execution
 *
 * Use ValkeyBannedEmailRepository with TestContainers for:
 * - Integration tests
 * - Testing real Valkey behavior
 */
export class InMemoryBannedEmailRepository implements BannedEmailRepository {
  private bannedEmails: Set<string> = new Set();

  async isBanned(email: string): Promise<boolean> {
    email = email.toLowerCase();
    return this.bannedEmails.has(email);
  }

  async ban(email: string): Promise<void> {
     email = email.toLowerCase();
     this.bannedEmails.add(email);
  }

  async unban(email: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getAllBanned(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  async clear(): Promise<void> {
    this.bannedEmails.clear();
  }
}
