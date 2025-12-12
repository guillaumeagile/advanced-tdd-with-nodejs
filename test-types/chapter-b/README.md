# Chapter B: Coupling & Abstraction

## The Problem: Tight Coupling

**Coupling** is the degree to which one module depends on another. High coupling means:
- Changes in one place break other places
- Hard to test in isolation
- Hard to reuse components
- Difficult to understand dependencies

```typescript
// ✗ Tightly coupled - depends on concrete implementation
class UserService {
  private db = new PostgresDatabase(); // Hard-coded dependency

  createUser(name: string) {
    return this.db.insert('users', { name });
  }
}

// If we want to use a different database, we must modify UserService
```

## The Solution: Abstraction

**Abstraction** means depending on **what** something does (interface), not **how** it does it (implementation).

```typescript
// ✓ Loosely coupled - depends on abstraction
interface Database {
  insert(table: string, data: any): any;
}

class UserService {
  constructor(private db: Database) {} // Injected dependency

  createUser(name: string) {
    return this.db.insert('users', { name });
  }
}

// Now we can use any Database implementation
```

## Interfaces as Contracts

An **interface** is a contract that says "I promise to have these methods with these signatures."

```typescript
// The contract
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Multiple implementations
class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
  error(message: string) { console.error(message); }
}

class FileLogger implements Logger {
  log(message: string) { /* write to file */ }
  error(message: string) { /* write to file */ }
}

// Code depends on the contract, not the implementation
function processUser(logger: Logger) {
  logger.log('Processing user...');
  // Works with any Logger implementation
}
```

## Dependency Injection (The Simple Way)

**Dependency Injection** means passing dependencies as parameters instead of creating them internally.

### Constructor Injection
```typescript
class UserService {
  constructor(private db: Database, private logger: Logger) {}

  createUser(name: string) {
    this.logger.log('Creating user...');
    return this.db.insert('users', { name });
  }
}

// Inject dependencies when creating the service
const db = new PostgresDatabase();
const logger = new ConsoleLogger();
const service = new UserService(db, logger);
```

### Method Injection
```typescript
class UserService {
  createUser(name: string, db: Database, logger: Logger) {
    logger.log('Creating user...');
    return db.insert('users', { name });
  }
}

// Inject dependencies when calling the method
service.createUser('Alice', db, logger);
```

### Parameter Objects
```typescript
interface UserServiceDeps {
  db: Database;
  logger: Logger;
  emailService: EmailService;
}

class UserService {
  constructor(private deps: UserServiceDeps) {}

  createUser(name: string) {
    this.deps.logger.log('Creating user...');
    const user = this.deps.db.insert('users', { name });
    this.deps.emailService.send(user.email, 'Welcome!');
    return user;
  }
}
```

## Orthogonality

**Orthogonality** means components are independent - changing one doesn't affect others.

```typescript
// ✗ Not orthogonal - Logger depends on Database
class Logger {
  constructor(private db: Database) {}
  log(message: string) {
    this.db.insert('logs', { message }); // Logger depends on Database
  }
}

// ✓ Orthogonal - Logger is independent
interface LogWriter {
  write(message: string): void;
}

class Logger {
  constructor(private writer: LogWriter) {}
  log(message: string) {
    this.writer.write(message); // Logger depends on abstraction
  }
}
```

## Testability Through DI

Dependency Injection makes testing easy because we can inject **test doubles** (mocks, stubs, fakes).

```typescript
// Mock implementation for testing
class MockDatabase implements Database {
  private data: any[] = [];

  insert(table: string, data: any) {
    this.data.push(data);
    return { id: '1', ...data };
  }

  getData() { return this.data; }
}

// Test with mock
describe('UserService', () => {
  it('should create a user', () => {
    const mockDb = new MockDatabase();
    const mockLogger = { log: jest.fn(), error: jest.fn() };
    const service = new UserService(mockDb, mockLogger);

    const user = service.createUser('Alice');

    expect(user.name).toBe('Alice');
    expect(mockLogger.log).toHaveBeenCalled();
  });
});
```

## Benefits of Abstraction

| Benefit | Without Abstraction | With Abstraction |
|---------|-------------------|------------------|
| **Coupling** | High - changes break things | Low - changes are isolated |
| **Testing** | Hard - must use real services | Easy - use mocks |
| **Reusability** | Low - tied to implementation | High - works with any implementation |
| **Flexibility** | Low - hard to change | High - swap implementations easily |
| **Clarity** | Low - dependencies hidden | High - dependencies explicit |

## Key Takeaways

- **Tight coupling** makes code fragile and hard to test
- **Abstraction** (interfaces) decouples code from implementation
- **Dependency Injection** makes dependencies explicit and testable
- **Orthogonality** means components are independent
- **Test doubles** (mocks) are only possible with DI
- **Interfaces are contracts** - depend on what, not how

---

**Next: [Working Examples](./01-coupling.test.ts)**
