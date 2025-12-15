# Chapter B: Coupling & Abstraction

## From Cohesion to Coupling: Understanding Connascence

In Chapter A, we learned that **cohesion** means grouping related things together. But there's a cost to cohesion: when things are grouped together, they become **connected**. This connection is called **connascence**.

**Connascence** is the degree to which two pieces of code must know about each other. It's not inherently bad—it's necessary. But like cohesion, it comes in different levels:

- **Static connascence**: Dependencies visible at compile-time (types, interfaces)
- **Dynamic connascence**: Dependencies that emerge at runtime (state changes, timing)

The goal of a good developer is to **maximize cohesion while minimizing coupling**. This means:
1. Keep related things together (cohesion)
2. But reduce unnecessary dependencies between them (coupling)

---

## The Hidden Cost: Internal State as Coupling

When a function depends on **internal state** (class fields or variables), it becomes coupled to that state. This coupling is often invisible but very real.

### Example 1: Function Coupled to Class State

```typescript
class Counter {
  private count = 0;  // Internal state

  increment() {
    this.count++;     // Function depends on internal state
  }

  getCount(): number {
    return this.count;
  }
}

// The problem:
// - increment() is coupled to the 'count' field
// - If we change how count is stored, increment() breaks
// - increment() can't be tested independently
// - increment() has side effects (modifies state)
```

**Why is this coupling?**
- `increment()` doesn't receive `count` as a parameter
- `increment()` doesn't return the new count
- `increment()` is **tightly bound** to the internal `count` field
- Changing the field name or type breaks the method

### Example 2: Temporal Coupling

Functions can also be coupled through **time**—they must be called in a specific order:

```typescript
class UserAccount {
  private user: User | null = null;
  private isVerified = false;

  setUser(user: User) {
    this.user = user;
  }

  verify() {
    if (!this.user) {
      throw new Error('User not set!');  // ✗ Temporal coupling
    }
    this.isVerified = true;
  }

  getUser(): User {
    if (!this.isVerified) {
      throw new Error('User not verified!');  // ✗ Temporal coupling
    }
    return this.user;
  }
}

// The problem:
// - verify() must be called AFTER setUser()
// - getUser() must be called AFTER verify()
// - If you call them in wrong order, it fails
// - This is temporal coupling - order matters
```

**Why is this coupling?**
- Methods depend on the **state history**, not just current state
- You must remember the correct sequence
- Easy to use incorrectly
- Hard to test all combinations

### Example 3: Scope Coupling in Functions

Even simple functions can be coupled to outer scope:

```typescript
let globalCounter = 0;  // Global state

function incrementGlobal() {
  globalCounter++;      // Coupled to global variable
}

function getGlobalCounter(): number {
  return globalCounter; // Coupled to global variable
}

// The problem:
// - Both functions depend on globalCounter
// - If globalCounter changes, both break
// - Hard to test - must manage global state
// - Can't run tests in parallel (shared state)
// - Impossible to reuse these functions independently
```

---

## The Solution: Minimize Internal Dependencies

The key principle is: **reduce the surface of internal dependencies and state**.

### Approach 1: Pure Functions (No Internal State)

```typescript
// ✓ Pure function - no internal state dependency
function increment(count: number): number {
  return count + 1;
}

// ✓ Pure function - receives state as parameter
function getDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

// Benefits:
// - No coupling to internal state
// - Easy to test - just pass inputs, check outputs
// - Can be called in any order
// - Predictable - same input always gives same output
```

### Approach 2: Immutability (No State Mutation)

```typescript
// ✗ Mutable - modifies internal state
class MutableCounter {
  private count = 0;

  increment() {
    this.count++;  // Modifies state
  }

  getCount(): number {
    return this.count;
  }
}

// ✓ Immutable - returns new object instead of modifying
class ImmutableCounter {
  constructor(private count: number) {}

  increment(): ImmutableCounter {
    return new ImmutableCounter(this.count + 1);  // Returns new instance
  }

  getCount(): number {
    return this.count;
  }
}

// Usage:
const counter1 = new ImmutableCounter(0);
const counter2 = counter1.increment();  // Creates new instance
const counter3 = counter2.increment();  // Creates another new instance

// Benefits:
// - No side effects
// - Each operation is independent
// - Easy to test
// - No temporal coupling
```

### Approach 3: Explicit Dependencies (Dependency Injection)

```typescript
// ✗ Hidden dependency on internal state
class UserService {
  private db = new Database();  // Hidden dependency

  createUser(name: string) {
    return this.db.insert('users', { name });
  }
}

// ✓ Explicit dependency - passed as parameter
class UserService {
  createUser(name: string, db: Database): User {
    return db.insert('users', { name });
  }
}

// Or with constructor injection:
class UserService {
  constructor(private db: Database) {}  // Explicit dependency

  createUser(name: string): User {
    return this.db.insert('users', { name });
  }
}

// Benefits:
// - Dependencies are visible
// - Easy to test - inject mock database
// - Easy to understand what the method needs
// - Not coupled to specific Database implementation
```

---

## Practical Example: Building a Better Counter

Let's see how to reduce coupling in a real scenario:

```typescript
// ❌ TIGHTLY COUPLED - Multiple problems
class BadCounter {
  private count = 0;
  private history: number[] = [];

  increment() {
    this.count++;
    this.history.push(this.count);  // Coupled to history field
  }

  decrement() {
    this.count--;
    this.history.push(this.count);  // Coupled to history field
  }

  getCount(): number {
    return this.count;              // Coupled to count field
  }

  getHistory(): number[] {
    return this.history;            // Coupled to history field
  }
}

// Problems:
// - increment() and decrement() both depend on history
// - Can't change how history is stored without breaking both
// - Hard to test - must verify both count and history
// - Temporal coupling - history must be maintained
```

```typescript
// ✅ LOOSELY COUPLED - Pure functions + Immutability
class BetterCounter {
  constructor(
    private count: number,
    private history: readonly number[] = []
  ) {}

  // Pure function - returns new instance
  increment(): BetterCounter {
    const newCount = this.count + 1;
    return new BetterCounter(newCount, [...this.history, newCount]);
  }

  // Pure function - returns new instance
  decrement(): BetterCounter {
    const newCount = this.count - 1;
    return new BetterCounter(newCount, [...this.history, newCount]);
  }

  // No side effects - just returns value
  getCount(): number {
    return this.count;
  }

  // No side effects - just returns value
  getHistory(): readonly number[] {
    return this.history;
  }
}

// Benefits:
// - Each method is independent
// - No shared mutable state
// - Easy to test - just check return values
// - No temporal coupling
// - Can chain operations safely
```

Usage comparison:

```typescript
// Bad counter - must track state
const bad = new BadCounter();
bad.increment();
bad.increment();
console.log(bad.getCount());  // 2
console.log(bad.getHistory()); // [1, 2]

// Better counter - immutable, composable
const better = new BetterCounter(0)
  .increment()
  .increment();
console.log(better.getCount());  // 2
console.log(better.getHistory()); // [1, 2]
```

---

## Key Principles

1. **Minimize internal state** - Less state = less coupling
2. **Use pure functions** - Functions without side effects are easier to test and compose
3. **Prefer immutability** - Immutable objects can't have temporal coupling
4. **Make dependencies explicit** - Pass state as parameters, not hidden in fields
5. **Reduce the surface of dependencies** - Fewer things depending on each other = less coupling

---

## Inheritance vs Composition: How We Can Fight Coupling

example of coupling through bad inheritance:


example of solving that coupling by replacing inheritance by composition



## The core of the Problem: Tight Coupling

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
