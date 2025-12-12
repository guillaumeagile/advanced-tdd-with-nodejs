describe('Chapter D: Honest Functions with Types', () => {
  describe('1. Pure Functions', () => {
    it('should understand pure functions - no side effects', () => {
      // ✓ Pure - always returns same output for same input
      function add(a: number, b: number): number {
        return a + b;
      }

      expect(add(2, 3)).toBe(5);
      expect(add(2, 3)).toBe(5); // Same result
    });

    it('should identify impure functions - external state', () => {
      // ✗ Impure - depends on external state
      let count = 0;
      function increment(): number {
        count++; // Side effect!
        return count;
      }

      expect(increment()).toBe(1);
      expect(increment()).toBe(2); // Different result!
    });

    it('should identify impure functions - side effects', () => {
      // ✗ Impure - has side effects
      const logs: string[] = [];

      function logAndReturn(message: string): string {
        logs.push(message); // Side effect!
        return message;
      }

      logAndReturn('Hello');
      expect(logs).toContain('Hello');
    });

    it('should write pure functions - no external dependencies', () => {
      // ✓ Pure - no external state
      function isValidEmail(email: string): boolean {
        return email.includes('@');
      }

      // Types inferred from function return
      const result1 = isValidEmail('alice@example.com');
      const result2 = isValidEmail('invalid');

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should write pure functions - immutable operations', () => {
      // ✓ Pure - creates new array instead of modifying
      function addItem<T>(items: T[], newItem: T): T[] {
        return [...items, newItem]; // New array
      }

      const original = [1, 2, 3];
      const updated = addItem(original, 4);

      expect(original).toEqual([1, 2, 3]); // Original unchanged
      expect(updated).toEqual([1, 2, 3, 4]);
    });

    it('should write pure functions - deterministic', () => {
      // ✓ Pure - always returns same result
      function calculateTotal(items: { price: number }[]): number {
        return items.reduce((sum, item) => sum + item.price, 0);
      }

      const items = [{ price: 10 }, { price: 20 }];

      expect(calculateTotal(items)).toBe(30);
      expect(calculateTotal(items)).toBe(30); // Same result
    });
  });

  describe('2. Input Types as Contracts', () => {
    it('should use unclear input types', () => {
      // ✗ Unclear - what does data contain?
      function processData(data: any): string {
        return data.name + data.age;
      }

      const result = processData({ name: 'Alice', age: 30 });
      expect(result).toBe('Alice30');
    });

    it('should use clear input types', () => {
      // ✓ Clear - function expects a User
      interface User {
        name: string;
        age: number;
      }

      function processUser(user: User): string {
        return user.name + user.age;
      }

      const user: User = { name: 'Alice', age: 30 };
      const result = processUser(user);

      expect(result).toBe('Alice30');
    });

    it('should use semantic input types', () => {
      // ✓ Best - semantic types reveal intent
      class UserName {
        constructor(readonly value: string) {}
      }

      class Age {
        constructor(readonly value: number) {}
      }

      class User {
        constructor(readonly name: UserName, readonly age: Age) {}
      }

      function processUser(user: User): string {
        return user.name.value + user.age.value;
      }

      const user = new User(new UserName('Alice'), new Age(30));
      const result = processUser(user);

      expect(result).toBe('Alice30');
    });

    it('should enforce input contracts', () => {
      interface Repository<T> {
        findById(id: string): T | null;
      }

      class User {
        constructor(readonly id: string, readonly name: string) {}
      }

      function getUserName(id: string, repo: Repository<User>): string | null {
        const user = repo.findById(id);
        return user ? user.name : null;
      }

      const mockRepo: Repository<User> = {
        findById: (id: string) => id === '1' ? new User('1', 'Alice') : null
      };

      expect(getUserName('1', mockRepo)).toBe('Alice');
      expect(getUserName('999', mockRepo)).toBeNull();
    });
  });

  describe('3. Output Types as Promises', () => {
    it('should use unclear output types', () => {
      // ✗ Unclear - does it return User or null? Or throw?
      function findUser(id: string) {
        if (id === '1') {
          return { id: '1', name: 'Alice' };
        }
        // Returns undefined implicitly
      }

      const user = findUser('1');
      expect(user?.name).toBe('Alice');

      const notFound = findUser('999');
      expect(notFound).toBeUndefined();
    });

    it('should use clear output types - union types', () => {
      // ✓ Clear - function returns User or null
      interface User {
        id: string;
        name: string;
      }

      function findUser(id: string): User | null {
        if (id === '1') {
          return { id: '1', name: 'Alice' };
        }
        return null;
      }

      const user = findUser('1');
      if (user !== null) {
        expect(user.name).toBe('Alice');
      }
    });

    it('should use Result type for explicit error handling', () => {
      // ✓ Better - Result type makes error explicit
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      interface User {
        id: string;
        name: string;
      }

      function findUser(id: string): Result<User, 'NotFound'> {
        if (id === '1') {
          return { ok: true, value: { id: '1', name: 'Alice' } };
        }
        return { ok: false, error: 'NotFound' };
      }

      const result = findUser('1');
      if (result.ok) {
        expect(result.value.name).toBe('Alice');
      }

      const notFound = findUser('999');
      expect(notFound.ok).toBe(false);
      if (!notFound.ok) {
        expect(notFound.error).toBe('NotFound');
      }
    });

    it('should use Option type for nullable values', () => {
      // ✓ Option type - explicit about nullable
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      interface User {
        id: string;
        name: string;
      }

      function findUser(id: string): Option<User> {
        if (id === '1') {
          return { isSome: true, value: { id: '1', name: 'Alice' } };
        }
        return { isSome: false };
      }

      const result = findUser('1');
      if (result.isSome) {
        expect(result.value.name).toBe('Alice');
      }
    });
  });

  describe('4. Semantic Types', () => {
    it('should use generic types - unclear intent', () => {
      // ✗ Generic - unclear what each number means
      function calculateDiscount(a: number, b: number): number {
        return a * (1 - b);
      }

      const result = calculateDiscount(100, 0.1);
      expect(result).toBe(90);
    });

    it('should use semantic type aliases', () => {
      // ✓ Semantic - clear intent
      type Price = number;
      type DiscountRate = number;

      function calculateDiscount(price: Price, discount: DiscountRate): Price {
        return price * (1 - discount);
      }

      const result = calculateDiscount(100, 0.1);
      expect(result).toBe(90);
    });

    it('should use semantic classes', () => {
      // ✓ Best - classes with validation
      class Price {
        constructor(readonly value: number) {
          if (value < 0) throw new Error('Price cannot be negative');
        }
      }

      class DiscountRate {
        constructor(readonly value: number) {
          if (value < 0 || value > 1) {
            throw new Error('Discount must be 0-1');
          }
        }
      }

      function calculateDiscount(price: Price, discount: DiscountRate): Price {
        return new Price(price.value * (1 - discount.value));
      }

      const result = calculateDiscount(new Price(100), new DiscountRate(0.1));
      expect(result.value).toBe(90);
    });
  });

  describe('5. Type-Driven Function Design', () => {
    it('should let types guide the implementation', () => {
      // Type signature reveals what function must do
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      interface User {
        id: string;
        name: string;
      }

      interface Repository<T> {
        findById(id: string): T | null;
      }

      function findById(id: string, repo: Repository<User>): Option<User> {
        const user = repo.findById(id);
        return user ? { isSome: true, value: user } : { isSome: false };
      }

      const mockRepo: Repository<User> = {
        findById: (id: string) => id === '1' ? { id: '1', name: 'Alice' } : null
      };

      const result = findById('1', mockRepo);
      expect(result.isSome).toBe(true);
      if (result.isSome) {
        expect(result.value.name).toBe('Alice');
      }
    });

    it('should use types to prevent invalid operations', () => {
      // Type prevents invalid states
      type NonEmptyArray<T> = [T, ...T[]];

      function getFirst<T>(items: NonEmptyArray<T>): T {
        return items[0];
      }

      const items: NonEmptyArray<number> = [1, 2, 3];
      expect(getFirst(items)).toBe(1);

      // This would be a type error:
      // const empty: NonEmptyArray<number> = []; // ✗ Type error
    });
  });

  describe('6. Composability Through Types', () => {
    it('should compose functions with clear types', () => {
      // Functions with clear input/output compose well
      class Email {
        constructor(readonly value: string) {}
      }

      class NormalizedEmail {
        constructor(readonly value: string) {}
      }

      function normalizeEmail(email: Email): NormalizedEmail {
        return new NormalizedEmail(email.value.toLowerCase());
      }

      function isBlacklisted(email: NormalizedEmail, blacklist: Set<string>): boolean {
        return blacklist.has(email.value);
      }

      const email = new Email('Alice@Example.com');
      const normalized = normalizeEmail(email);
      const blacklist = new Set(['alice@example.com']);
      const blocked = isBlacklisted(normalized, blacklist);

      expect(blocked).toBe(true);
    });

    it('should create reusable function pipelines', () => {
      // Pipe function for composition
      function pipe<A, B, C>(
        f1: (a: A) => B,
        f2: (b: B) => C
      ): (a: A) => C {
        return (a: A) => f2(f1(a));
      }

      const double = (n: number) => n * 2;
      const addOne = (n: number) => n + 1;

      const doubleThenAddOne = pipe(double, addOne);

      expect(doubleThenAddOne(5)).toBe(11); // (5 * 2) + 1
    });
  });

  describe('7. Honest Functions', () => {
    it('should be honest about nullable returns', () => {
      // ✗ Dishonest - type says User, might be null
      // function getUser(id: string): User {
      //   return database.find(id); // Might be null!
      // }

      // ✓ Honest - type tells the truth
      interface User {
        id: string;
        name: string;
      }

      function getUser(id: string): User | null {
        if (id === '1') {
          return { id: '1', name: 'Alice' };
        }
        return null;
      }

      const user = getUser('1');
      expect(user?.name).toBe('Alice');
    });

    it('should be honest about side effects', () => {
      // ✗ Dishonest - type says pure, but has side effects
      // function processOrder(order: Order): OrderConfirmation {
      //   sendEmail(order.customer.email); // Side effect!
      //   return new OrderConfirmation(order.id);
      // }

      // ✓ Honest - type reveals dependencies
      interface EmailService {
        send(email: string, message: string): void;
      }

      class Order {
        constructor(readonly id: string, readonly email: string) {}
      }

      class OrderConfirmation {
        constructor(readonly orderId: string) {}
      }

      function processOrder(order: Order, emailService: EmailService): OrderConfirmation {
        emailService.send(order.email, 'Order confirmed');
        return new OrderConfirmation(order.id);
      }

      const mockEmail: EmailService = {
        send: jest.fn()
      };

      const order = new Order('123', 'alice@example.com');
      const confirmation = processOrder(order, mockEmail);

      expect(confirmation.orderId).toBe('123');
      expect(mockEmail.send).toHaveBeenCalled();
    });

    it('should be honest about failures', () => {
      // ✗ Dishonest - type says User, but might throw
      // function createUser(email: Email): User {
      //   if (userExists(email)) {
      //     throw new Error('User already exists'); // Surprise!
      //   }
      //   return new User(email);
      // }

      // ✓ Honest - type reveals possibility of failure
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      class Email {
        constructor(readonly value: string) {}
      }

      class User {
        constructor(readonly email: Email) {}
      }

      const existingEmails = new Set(['alice@example.com']);

      function createUser(email: Email): Result<User, 'UserAlreadyExists'> {
        if (existingEmails.has(email.value)) {
          return { ok: false, error: 'UserAlreadyExists' };
        }
        return { ok: true, value: new User(email) };
      }

      const result = createUser(new Email('bob@example.com'));
      expect(result.ok).toBe(true);

      const duplicate = createUser(new Email('alice@example.com'));
      expect(duplicate.ok).toBe(false);
      if (!duplicate.ok) {
        expect(duplicate.error).toBe('UserAlreadyExists');
      }
    });
  });

  describe('8. Checkpoint 🫵', () => {
    it('D.1: Explain why pure functions are better than impure ones', () => {
      // Write your answer:
      // Pure functions:
      // 1. Are predictable - same input always gives same output
      // 2. Are testable - no need to mock external state
      // 3. Are composable - can combine safely
      // 4. Are parallelizable - no race conditions
      // 5. Are easier to reason about - no hidden dependencies

      expect(true).toBe(true);
    });

    it('D.2: Design an honest function for finding a user by email', () => {
      // Write your implementation:
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      class Email {
        constructor(readonly value: string) {}
      }

      class User {
        constructor(readonly id: string, readonly email: Email) {}
      }

      interface UserRepository {
        findByEmail(email: Email): User | null;
      }

      function findUserByEmail(
        email: Email,
        repo: UserRepository
      ): Result<User, 'NotFound'> {
        const user = repo.findByEmail(email);
        return user
          ? { ok: true, value: user }
          : { ok: false, error: 'NotFound' };
      }

      expect(true).toBe(true);
    });

    it('D.3: Identify dishonest functions', () => {
      // Dishonest function 1: Type says it returns string, might throw
      // function getUsername(id: string): string {
      //   const user = database.find(id);
      //   return user.name; // Might throw if user is null
      // }

      // Dishonest function 2: Type says it's pure, has side effects
      // function calculateTotal(items: Item[]): number {
      //   logger.log('Calculating total'); // Side effect!
      //   return items.reduce((sum, item) => sum + item.price, 0);
      // }

      // Dishonest function 3: Type says it returns number, might return null
      // function divide(a: number, b: number): number {
      //   if (b === 0) return null; // Dishonest!
      // }

      expect(true).toBe(true);
    });

    it('D.4: Refactor a dishonest function to be honest', () => {
      // Before: Dishonest
      // function getUser(id: string): User {
      //   return database.find(id); // Might be null!
      // }

      // After: Honest
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      class User {
        constructor(readonly id: string, readonly name: string) {}
      }

      function getUser(id: string): Option<User> {
        if (id === '1') {
          return { isSome: true, value: new User('1', 'Alice') };
        }
        return { isSome: false };
      }

      const result = getUser('1');
      expect(result.isSome).toBe(true);
    });
  });
});
