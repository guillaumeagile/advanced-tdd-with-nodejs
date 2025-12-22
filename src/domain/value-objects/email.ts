import { ValueObject } from '../../shared/types/common.js';

export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  private static hasConsecutiveDots(email: string): boolean {
    return email.includes('..');
  }

  constructor(email: string) {
    email = email.toLowerCase().trim();
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    super( email);
  }

  public static isValid(email: string): boolean {
    return email.length > 0 && email.length <= 254 && !Email.hasConsecutiveDots(email)
        &&  Email.EMAIL_REGEX.test(email);
  }

  public static create(email: string): Email {
    return new Email(email);
  }

  public getDomain(): string {
    return this.value.split('@')[1];
  }

  public getLocalPart(): string {
    return this.value.split('@')[0];
  }
}
