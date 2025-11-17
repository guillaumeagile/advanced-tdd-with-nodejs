import { AntiSpamPort } from '../../domain/ports/anti-spam.port.js';
import { BannedEmailRepository } from '../../domain/ports/banned-email.repository.js';

/**
 * ValkeyAntiSpamAdapter - Production Implementation
 *
 * This adapter implements the AntiSpamPort using a Valkey-backed banned email repository.
 * It checks if an email is in a banned list stored in Valkey.
 *
 * Architecture:
 * - Implements: AntiSpamPort (domain port)
 * - Depends on: BannedEmailRepository (domain port)
 * - Uses: Valkey via ValkeyBannedEmailRepository adapter  OR in-memory repository
 *
 * This demonstrates:
 * - Port composition: One port depending on another
 * - Hexagonal Architecture: Multiple layers of adapters
 * - Dependency Injection: Repository injected via constructor
 */
export class RepositoryAntiSpamAdapter implements AntiSpamPort {
  constructor(private readonly bannedEmailRepository: BannedEmailRepository) {}

  async isBlocked(email: string): Promise<boolean> {
    try {
      return await this.bannedEmailRepository.isBanned(email);
    } catch (error) {
      // Fail open: allow email if repository check fails
      // log.error('Failed to check banned email list:', error);
      return false;
    }
  }
}
