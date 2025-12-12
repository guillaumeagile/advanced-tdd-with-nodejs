describe('Chapter B: Coupling & Abstraction', () => {
  describe('1. Tight Coupling Problem', () => {
    it('should show how tight coupling makes code fragile', () => {
      // ✗ Tightly coupled - depends on concrete implementation
      class PostgresDatabase {
        insert(table: string, data: any) {
          return { id: '1', ...data };
        }
      }

      class UserService {
        private db = new PostgresDatabase(); // Hard-coded dependency

        createUser(name: string) {
          return this.db.insert('users', { name });
        }
      }

      const service = new UserService();
      const user = service.createUser('Alice');

      expect(user.name).toBe('Alice');

      // Problem: If we want to use MongoDB instead, we must modify UserService
      // This violates the Open/Closed Principle
    });

    it('should show how tight coupling makes testing hard', () => {
      class RealDatabase {
        insert(table: string, data: any) {
          // In real code, this would connect to a real database
          throw new Error('Cannot connect to database in test');
        }
      }

      class UserService {
        private db = new RealDatabase(); // Can't replace with mock

        createUser(name: string) {
          return this.db.insert('users', { name });
        }
      }

      // We can't test this without a real database
      // const service = new UserService();
      // const user = service.createUser('Alice'); // ✗ Would fail
    });
  });

  describe('2. Abstraction Solution', () => {
    it('should use interfaces to decouple from implementation', () => {
      // ✓ Define the contract
      interface Database {
        insert(table: string, data: any): any;
      }

      // ✓ Implement the contract
      class PostgresDatabase implements Database {
        insert(table: string, data: any) {
          return { id: '1', ...data };
        }
      }

      // ✓ Depend on abstraction, not implementation
      class UserService {
        constructor(private db: Database) {}

        createUser(name: string) {
          return this.db.insert('users', { name });
        }
      }

      const db = new PostgresDatabase();
      const service = new UserService(db);
      const user = service.createUser('Alice');

      expect(user.name).toBe('Alice');
    });

    it('should allow multiple implementations of the same interface', () => {
      interface Database {
        insert(table: string, data: any): any;
      }

      class PostgresDatabase implements Database {
        insert(table: string, data: any) {
          return { id: '1', ...data };
        }
      }

      class MongoDatabase implements Database {
        insert(table: string, data: any) {
          return { _id: '1', ...data };
        }
      }

      class UserService {
        constructor(private db: Database) {}
        createUser(name: string) {
          return this.db.insert('users', { name });
        }
      }

      // Works with Postgres
      const pgService = new UserService(new PostgresDatabase());
      const pgUser = pgService.createUser('Alice');
      expect(pgUser.id).toBe('1');

      // Works with MongoDB
      const mongoService = new UserService(new MongoDatabase());
      const mongoUser = mongoService.createUser('Bob');
      expect(mongoUser._id).toBe('1');

      // Same service, different implementations
    });
  });

  describe('3. Dependency Injection', () => {
    it('should use constructor injection', () => {
      interface Logger {
        log(message: string): void;
      }

      interface Database {
        insert(table: string, data: any): any;
      }

      class ConsoleLogger implements Logger {
        log(message: string) {
          // console.log(message);
        }
      }

      class MockDatabase implements Database {
        insert(table: string, data: any) {
          return { id: '1', ...data };
        }
      }

      class UserService {
        constructor(private db: Database, private logger: Logger) {}

        createUser(name: string) {
          this.logger.log(`Creating user: ${name}`);
          return this.db.insert('users', { name });
        }
      }

      const db = new MockDatabase();
      const logger = new ConsoleLogger();
      const service = new UserService(db, logger);

      const user = service.createUser('Alice');
      expect(user.name).toBe('Alice');
    });

    it('should use method injection for optional dependencies', () => {
      interface Logger {
        log(message: string): void;
      }

      class UserService {
        createUser(name: string, logger?: Logger) {
          logger?.log(`Creating user: ${name}`);
          return { id: '1', name };
        }
      }

      const mockLogger = { log: jest.fn() };
      const service = new UserService();

      // Without logger
      const user1 = service.createUser('Alice');
      expect(user1.name).toBe('Alice');

      // With logger
      const user2 = service.createUser('Bob', mockLogger);
      expect(mockLogger.log).toHaveBeenCalledWith('Creating user: Bob');
    });

    it('should use parameter objects for many dependencies', () => {
      interface Database {
        insert(table: string, data: any): any;
      }

      interface Logger {
        log(message: string): void;
      }

      interface EmailService {
        send(email: string, message: string): void;
      }

      interface UserServiceDeps {
        db: Database;
        logger: Logger;
        emailService: EmailService;
      }

      class UserService {
        constructor(private deps: UserServiceDeps) {}

        createUser(name: string, email: string) {
          this.deps.logger.log(`Creating user: ${name}`);
          const user = this.deps.db.insert('users', { name, email });
          this.deps.emailService.send(email, 'Welcome!');
          return user;
        }
      }

      const deps: UserServiceDeps = {
        db: { insert: jest.fn().mockReturnValue({ id: '1', name: 'Alice', email: 'alice@example.com' }) },
        logger: { log: jest.fn() },
        emailService: { send: jest.fn() }
      };

      const service = new UserService(deps);
      const user = service.createUser('Alice', 'alice@example.com');

      expect(user.name).toBe('Alice');
      expect(deps.logger.log).toHaveBeenCalled();
      expect(deps.emailService.send).toHaveBeenCalled();
    });
  });

  describe('4. Interfaces as Contracts', () => {
    it('should define contracts that multiple implementations can fulfill', () => {
      interface Logger {
        log(message: string): void;
        error(message: string): void;
      }

      class ConsoleLogger implements Logger {
        log(message: string) {
          // console.log(message);
        }
        error(message: string) {
          // console.error(message);
        }
      }

      class FileLogger implements Logger {
        private logs: string[] = [];

        log(message: string) {
          this.logs.push(`[LOG] ${message}`);
        }

        error(message: string) {
          this.logs.push(`[ERROR] ${message}`);
        }

        getLogs() { return this.logs; }
      }

      // Code depends on the contract
      function processUser(logger: Logger) {
        logger.log('Processing user...');
        logger.error('User not found');
      }

      const fileLogger = new FileLogger();
      processUser(fileLogger);

      expect(fileLogger.getLogs()).toContain('[LOG] Processing user...');
      expect(fileLogger.getLogs()).toContain('[ERROR] User not found');
    });

    it('should enforce that implementations fulfill the contract', () => {
      interface Repository<T> {
        save(item: T): void;
        findById(id: string): T | null;
      }

      class UserRepository implements Repository<{ id: string; name: string }> {
        private users: { id: string; name: string }[] = [];

        save(user: { id: string; name: string }) {
          this.users.push(user);
        }

        findById(id: string) {
          return this.users.find(u => u.id === id) || null;
        }
      }

      const repo = new UserRepository();
      repo.save({ id: '1', name: 'Alice' });

      const user = repo.findById('1');
      expect(user?.name).toBe('Alice');
    });
  });

  describe('5. Orthogonality', () => {
    it('should show non-orthogonal design - Logger depends on Database', () => {
      interface Database {
        insert(table: string, data: any): any;
      }

      // ✗ Not orthogonal - Logger depends on Database
      class Logger {
        constructor(private db: Database) {}

        log(message: string) {
          this.db.insert('logs', { message }); // Coupling!
        }
      }

      // If we want to use Logger without Database, we can't
      // Logger is not independent
    });

    it('should show orthogonal design - Logger is independent', () => {
      interface LogWriter {
        write(message: string): void;
      }

      // ✓ Orthogonal - Logger is independent
      class Logger {
        constructor(private writer: LogWriter) {}

        log(message: string) {
          this.writer.write(message);
        }
      }

      // Logger can work with any LogWriter
      const fileWriter: LogWriter = {
        write: (msg: string) => {
          // write to file
        }
      };

      const logger = new Logger(fileWriter);
      logger.log('Test message');

      expect(true).toBe(true); // Logger works independently
    });

    it('should show how orthogonal components are easier to test', () => {
      interface LogWriter {
        write(message: string): void;
      }

      class Logger {
        constructor(private writer: LogWriter) {}
        log(message: string) {
          this.writer.write(message);
        }
      }

      // Easy to test with a mock
      const mockWriter: LogWriter = {
        write: jest.fn()
      };

      const logger = new Logger(mockWriter);
      logger.log('Test message');

      expect(mockWriter.write).toHaveBeenCalledWith('Test message');
    });
  });

  describe('6. Testability Through DI', () => {
    it('should use mocks for testing', () => {
      interface Database {
        insert(table: string, data: any): any;
      }

      class MockDatabase implements Database {
        private data: any[] = [];

        insert(table: string, data: any) {
          this.data.push(data);
          return { id: '1', ...data };
        }

        getData() { return this.data; }
      }

      class UserService {
        constructor(private db: Database) {}
        createUser(name: string) {
          return this.db.insert('users', { name });
        }
      }

      const mockDb = new MockDatabase();
      const service = new UserService(mockDb);

      const user = service.createUser('Alice');

      expect(user.name).toBe('Alice');
      expect(mockDb.getData()).toHaveLength(1);
    });

    it('should use stubs for testing', () => {
      interface EmailService {
        send(email: string, message: string): Promise<boolean>;
      }

      class UserService {
        constructor(private emailService: EmailService) {}

        async createUser(name: string, email: string) {
          const sent = await this.emailService.send(email, 'Welcome!');
          return { id: '1', name, email, welcomeSent: sent };
        }
      }

      // Stub - returns a fixed value
      const stubEmail: EmailService = {
        send: jest.fn().mockResolvedValue(true)
      };

      const service = new UserService(stubEmail);
      return service.createUser('Alice', 'alice@example.com').then(user => {
        expect(user.welcomeSent).toBe(true);
      });
    });

    it('should use fakes for testing', () => {
      interface Database {
        insert(table: string, data: any): any;
        findById(id: string): any;
      }

      // Fake - working implementation but simplified for testing
      class InMemoryDatabase implements Database {
        private data: Map<string, any> = new Map();
        private nextId = 1;

        insert(table: string, data: any) {
          const id = String(this.nextId++);
          this.data.set(id, { id, ...data });
          return this.data.get(id);
        }

        findById(id: string) {
          return this.data.get(id) || null;
        }
      }

      class UserService {
        constructor(private db: Database) {}
        createUser(name: string) {
          return this.db.insert('users', { name });
        }
        getUser(id: string) {
          return this.db.findById(id);
        }
      }

      const fakeDb = new InMemoryDatabase();
      const service = new UserService(fakeDb);

      const user = service.createUser('Alice');
      const retrieved = service.getUser(user.id);

      expect(retrieved.name).toBe('Alice');
    });
  });

  describe('7. Checkpoint 🫵', () => {
    it('B.1: Explain the difference between tight and loose coupling', () => {
      // Write your answer:
      // Tight coupling: Components depend on concrete implementations
      // - Hard to test (can't use mocks)
      // - Hard to change (modifications break things)
      // - Hard to reuse (tied to specific implementation)
      //
      // Loose coupling: Components depend on abstractions
      // - Easy to test (can inject mocks)
      // - Easy to change (swap implementations)
      // - Easy to reuse (works with any implementation)

      expect(true).toBe(true);
    });

    it('B.2: Design an abstraction for a payment processor', () => {
      // Write your interface here:
      interface PaymentProcessor {
        charge(amount: number, cardToken: string): Promise<{ success: boolean; transactionId: string }>;
        refund(transactionId: string): Promise<boolean>;
      }

      // Write two implementations:
      class StripePaymentProcessor implements PaymentProcessor {
        async charge(amount: number, cardToken: string) {
          return { success: true, transactionId: 'stripe_123' };
        }
        async refund(transactionId: string) {
          return true;
        }
      }

      class PayPalPaymentProcessor implements PaymentProcessor {
        async charge(amount: number, cardToken: string) {
          return { success: true, transactionId: 'paypal_456' };
        }
        async refund(transactionId: string) {
          return true;
        }
      }

      expect(true).toBe(true);
    });

    it('B.3: Identify tight coupling in this code', () => {
      // ✗ Tightly coupled code:
      class OrderService {
        private emailService = new GmailEmailService(); // Hard-coded!

        placeOrder(orderId: string, email: string) {
          this.emailService.send(email, `Order ${orderId} confirmed`);
          return { orderId, confirmed: true };
        }
      }

      class GmailEmailService {
        send(email: string, message: string) {
          // Send via Gmail
        }
      }

      // Problems:
      // 1. Can't use different email service without modifying OrderService
      // 2. Can't test without actually sending emails
      // 3. OrderService depends on GmailEmailService implementation

      expect(true).toBe(true);
    });

    it('B.4: Refactor tight coupling to use DI', () => {
      // ✓ Loosely coupled code:
      interface EmailService {
        send(email: string, message: string): void;
      }

      class OrderService {
        constructor(private emailService: EmailService) {}

        placeOrder(orderId: string, email: string) {
          this.emailService.send(email, `Order ${orderId} confirmed`);
          return { orderId, confirmed: true };
        }
      }

      class MockEmailService implements EmailService {
        send(email: string, message: string) {
          // Mock implementation
        }
      }

      const mockEmail = new MockEmailService();
      const service = new OrderService(mockEmail);
      const order = service.placeOrder('123', 'alice@example.com');

      expect(order.confirmed).toBe(true);
    });
  });
});
