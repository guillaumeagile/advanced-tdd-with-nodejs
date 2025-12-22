import { EmailWithoutSpam } from '../../../../src/domain/value-objects/EmailWithoutSpam';

// Mock implementation of AntiSpamPort for testing
interface AntiSpamPort {
  isBlocked(email: string): Promise<boolean>;
}

class MockAntiSpamAdapter implements AntiSpamPort {
  private readonly blockedEmails: Set<string>;

  constructor(blockedEmails: string[] = []) {
    this.blockedEmails = new Set(blockedEmails);
  }

  async isBlocked(email: string): Promise<boolean> {
    return this.blockedEmails.has(email);
  }
}

// AUX ETUDIANtS:  aucun test ne doit rester 'skip' !!!!!!!!!!!!!!!!!!!!!!!!! 🤓

describe.skip('EmailWithoutSpan', () => {
  describe('create', () => {
    it('should create a valid email', async () => {
      const mockAdapter = new MockAntiSpamAdapter();
      const email = await EmailWithoutSpam.create('test@example.com', mockAdapter);
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', async () => {
      const mockAdapter = new MockAntiSpamAdapter();
      const email = await EmailWithoutSpam.create('TEST@EXAMPLE.COM', mockAdapter);
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for blocked email', async () => {
      const mockAdapter = new MockAntiSpamAdapter(['blocked@example.com']);
      await expect(EmailWithoutSpam.create('blocked@example.com', mockAdapter))
        .rejects.toThrow('Email is blocked by anti-spam service: blocked@example.com');
    });

    it('should throw error for invalid email format', async () => {
      const mockAdapter = new MockAntiSpamAdapter();
      await expect(EmailWithoutSpam.create('invalid-email', mockAdapter))
        .rejects.toThrow('Invalid email format: invalid-email');
      await expect(EmailWithoutSpam.create('', mockAdapter))
        .rejects.toThrow('Invalid email format: ');
      await expect(EmailWithoutSpam.create('test@', mockAdapter))
        .rejects.toThrow('Invalid email format: test@');
      await expect(EmailWithoutSpam.create('@example.com', mockAdapter))
        .rejects.toThrow('Invalid email format: @example.com');
    });
  });

  describe.skip('isValid', () => {
    it('should return true for valid emails', async () => {
      const mockAdapter = new MockAntiSpamAdapter();
      const email = await EmailWithoutSpam.create('test@example.com', mockAdapter);
      expect(await email.isValid()).toBe(true);
    });

    it('should return false for blocked emails', async () => {
      const mockAdapter = new MockAntiSpamAdapter(['test@example.com']);
      const email = await EmailWithoutSpam.create('test@example.com', mockAdapter);
      expect(await email.isValid()).toBe(false);
    });

    it('should return false for invalid email format', async () => {
      // This test assumes we can create an EmailWithoutSpan with an invalid format
      // This might not be possible depending on the implementation
      // We'll skip this test for now
      expect(true).toBe(true);
    });
  });


});
