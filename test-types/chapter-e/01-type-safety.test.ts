describe('Chapter E: Type Safety & Feedback', () => {
  describe('1. Making Illegal States Unrepresentable', () => {
    it('should show how permissive types allow illegal states', () => {
      // ✗ Illegal states are possible
      type User = {
        name: string;
        email: string;
        status: string; // Can be any string
        isActive: boolean;
        isDeleted: boolean; // Both can be true!
      };

      const user: User = {
        name: 'Alice',
        email: 'alice@example.com',
        status: 'invalid-status', // ✗ Invalid but allowed
        isActive: true,
        isDeleted: true // ✗ Contradictory but allowed
      };

      expect(user.status).toBe('invalid-status');
    });

    it('should use restrictive types to prevent illegal states', () => {
      // ✓ Illegal states are impossible
      type UserStatus = 'active' | 'inactive' | 'suspended';

      type User = {
        name: string;
        email: string;
        status: UserStatus; // Only valid values
      };

      const user: User = {
        name: 'Alice',
        email: 'alice@example.com',
        status: 'active'
      };

      expect(user.status).toBe('active');

      // This would be a type error:
      // const invalid: User = { name: 'Bob', email: 'bob@example.com', status: 'invalid' };
    });

    it('should use discriminated unions to prevent contradictory states', () => {
      // ✓ Can't represent both active and deleted
      type User = 
        | { status: 'active'; name: string; email: string }
        | { status: 'inactive'; name: string; email: string; inactiveSince: Date }
        | { status: 'deleted'; deletedAt: Date };

      const activeUser: User = {
        status: 'active',
        name: 'Alice',
        email: 'alice@example.com'
      };

      const deletedUser: User = {
        status: 'deleted',
        deletedAt: new Date()
      };

      expect(activeUser.status).toBe('active');
      expect(deletedUser.status).toBe('deleted');
    });

    it('should use enums for restrictive types', () => {
      // ✓ Enums prevent invalid values
      enum OrderStatus {
        Pending = 'pending',
        Processing = 'processing',
        Shipped = 'shipped',
        Delivered = 'delivered',
        Cancelled = 'cancelled'
      }

      class Order {
        constructor(readonly id: string, readonly status: OrderStatus) {}
      }

      const order = new Order('123', OrderStatus.Pending);
      expect(order.status).toBe('pending');

      // This would be a type error:
      // const invalid = new Order('456', 'invalid-status');
    });
  });

  describe('2. The Problem with Null', () => {
    it('should show how null causes runtime errors', () => {
      // ✗ Null is implicit
      function findUser(id: string): { name: string } | null {
        if (id === '1') {
          return { name: 'Alice' };
        }
        return null;
      }

      const user = findUser('1');
      expect(user?.name).toBe('Alice');

      const notFound = findUser('999');
      expect(notFound).toBeNull();

      // Without null check, this would crash:
      // console.log(notFound.name); // ✗ Runtime error
    });

    it('should use Option type instead of null', () => {
      // ✓ Explicit with Option type
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      interface User {
        name: string;
      }

      function findUser(id: string): Option<User> {
        if (id === '1') {
          return { isSome: true, value: { name: 'Alice' } };
        }
        return { isSome: false };
      }

      const result = findUser('1');
      if (result.isSome) {
        expect(result.value.name).toBe('Alice');
      }

      const notFound = findUser('999');
      expect(notFound.isSome).toBe(false);
    });

    it('should chain Option operations safely', () => {
      // ✓ Option enables safe chaining
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      interface User {
        name: string;
        email: string;
      }

      function findUser(id: string): Option<User> {
        if (id === '1') {
          return { isSome: true, value: { name: 'Alice', email: 'alice@example.com' } };
        }
        return { isSome: false };
      }

      function getEmail(user: User): string {
        return user.email;
      }

      const userOpt = findUser('1');
      const emailOpt = userOpt.isSome ? { isSome: true, value: getEmail(userOpt.value) } : { isSome: false };

      if (emailOpt.isSome) {
        expect(emailOpt.value).toBe('alice@example.com');
      }
    });
  });

  describe('3. The Problem with Exceptions', () => {
    it('should show how exceptions are invisible in types', () => {
      // ✗ Exceptions are invisible
      function createUser(email: string): { id: string; email: string } {
        if (email.includes('@') === false) {
          throw new Error('Invalid email'); // Hidden!
        }
        return { id: '1', email };
      }

      // Caller doesn't know this might throw
      const user = createUser('alice@example.com');
      expect(user.email).toBe('alice@example.com');

      // This throws but type doesn't indicate it:
      expect(() => createUser('invalid')).toThrow('Invalid email');
    });

    it('should use Result type instead of exceptions', () => {
      // ✓ Result type makes errors explicit
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      interface User {
        id: string;
        email: string;
      }

      function createUser(email: string): Result<User, 'InvalidEmail'> {
        if (!email.includes('@')) {
          return { ok: false, error: 'InvalidEmail' };
        }
        return { ok: true, value: { id: '1', email } };
      }

      const result = createUser('alice@example.com');
      if (result.ok) {
        expect(result.value.email).toBe('alice@example.com');
      }

      const invalid = createUser('invalid');
      expect(invalid.ok).toBe(false);
      if (!invalid.ok) {
        expect(invalid.error).toBe('InvalidEmail');
      }
    });

    it('should handle multiple error types with Result', () => {
      // ✓ Result can represent multiple error types
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      type CreateUserError = 'InvalidEmail' | 'UserAlreadyExists' | 'EmailBlacklisted';

      interface User {
        id: string;
        email: string;
      }

      const existingEmails = new Set(['alice@example.com']);
      const blacklist = new Set(['spam@example.com']);

      function createUser(email: string): Result<User, CreateUserError> {
        if (!email.includes('@')) {
          return { ok: false, error: 'InvalidEmail' };
        }
        if (existingEmails.has(email)) {
          return { ok: false, error: 'UserAlreadyExists' };
        }
        if (blacklist.has(email)) {
          return { ok: false, error: 'EmailBlacklisted' };
        }
        return { ok: true, value: { id: '1', email } };
      }

      const result1 = createUser('alice@example.com');
      expect(result1.ok).toBe(false);
      if (!result1.ok) {
        expect(result1.error).toBe('UserAlreadyExists');
      }

      const result2 = createUser('spam@example.com');
      expect(result2.ok).toBe(false);
      if (!result2.ok) {
        expect(result2.error).toBe('EmailBlacklisted');
      }
    });
  });

  describe('4. Option Type', () => {
    it('should use Option to represent optional values', () => {
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      function findById(id: string): Option<{ id: string; name: string }> {
        if (id === '1') {
          return { isSome: true, value: { id: '1', name: 'Alice' } };
        }
        return { isSome: false };
      }

      const found = findById('1');
      expect(found.isSome).toBe(true);
      if (found.isSome) {
        expect(found.value.name).toBe('Alice');
      }

      const notFound = findById('999');
      expect(notFound.isSome).toBe(false);
    });

    it('should map over Option values', () => {
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      function map<T, U>(opt: Option<T>, f: (t: T) => U): Option<U> {
        return opt.isSome ? { isSome: true, value: f(opt.value) } : { isSome: false };
      }

      const opt: Option<number> = { isSome: true, value: 5 };
      const doubled = map(opt, (n) => n * 2);

      expect(doubled.isSome).toBe(true);
      if (doubled.isSome) {
        expect(doubled.value).toBe(10);
      }
    });

    it('should flatMap over Option values', () => {
      type Option<T> = { isSome: true; value: T } | { isSome: false };

      function flatMap<T, U>(opt: Option<T>, f: (t: T) => Option<U>): Option<U> {
        return opt.isSome ? f(opt.value) : { isSome: false };
      }

      const opt: Option<number> = { isSome: true, value: 5 };
      const result = flatMap(opt, (n) => {
        if (n > 3) {
          return { isSome: true, value: n * 2 };
        }
        return { isSome: false };
      });

      expect(result.isSome).toBe(true);
      if (result.isSome) {
        expect(result.value).toBe(10);
      }
    });
  });

  describe('5. Result Type', () => {
    it('should use Result to represent computations that might fail', () => {
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function divide(a: number, b: number): Result<number, 'DivisionByZero'> {
        if (b === 0) {
          return { ok: false, error: 'DivisionByZero' };
        }
        return { ok: true, value: a / b };
      }

      const success = divide(10, 2);
      expect(success.ok).toBe(true);
      if (success.ok) {
        expect(success.value).toBe(5);
      }

      const failure = divide(10, 0);
      expect(failure.ok).toBe(false);
      if (!failure.ok) {
        expect(failure.error).toBe('DivisionByZero');
      }
    });

    it('should map over Result values', () => {
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function mapResult<T, U, E>(res: Result<T, E>, f: (t: T) => U): Result<U, E> {
        return res.ok ? { ok: true, value: f(res.value) } : { ok: false, error: res.error };
      }

      const res: Result<number, string> = { ok: true, value: 5 };
      const doubled = mapResult(res, (n) => n * 2);

      expect(doubled.ok).toBe(true);
      if (doubled.ok) {
        expect(doubled.value).toBe(10);
      }
    });

    it('should flatMap over Result values', () => {
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function flatMapResult<T, U, E>(res: Result<T, E>, f: (t: T) => Result<U, E>): Result<U, E> {
        return res.ok ? f(res.value) : { ok: false, error: res.error };
      }

      const res: Result<number, string> = { ok: true, value: 5 };
      const result = flatMapResult(res, (n) => {
        if (n > 3) {
          return { ok: true, value: n * 2 };
        }
        return { ok: false, error: 'Value too small' };
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(10);
      }
    });

    it('should chain multiple Result operations', () => {
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function flatMapResult<T, U, E>(res: Result<T, E>, f: (t: T) => Result<U, E>): Result<U, E> {
        return res.ok ? f(res.value) : { ok: false, error: res.error };
      }

      function parseNumber(str: string): Result<number, 'NotANumber'> {
        const num = Number(str);
        return isNaN(num) ? { ok: false, error: 'NotANumber' } : { ok: true, value: num };
      }

      function divide(a: number, b: number): Result<number, 'DivisionByZero'> {
        return b === 0
          ? { ok: false, error: 'DivisionByZero' }
          : { ok: true, value: a / b };
      }

      const result = flatMapResult(
        parseNumber('10'),
        (a) => flatMapResult(parseNumber('2'), (b) => divide(a, b))
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(5);
      }
    });
  });

  describe('6. Fast Feedback Loops', () => {
    it('should show how types provide compile-time feedback', () => {
      // ✓ Type errors caught immediately
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

      // This would be caught at compile-time:
      // const invalid: User = { name: 'Bob' }; // ✗ Missing age
    });

    it('should show how semantic types provide better feedback', () => {
      // ✓ Semantic types catch more errors
      class UserName {
        constructor(readonly value: string) {
          if (value.length < 2) throw new Error('Name too short');
        }
      }

      class Age {
        constructor(readonly value: number) {
          if (value < 0 || value > 150) throw new Error('Invalid age');
        }
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

      // Invalid states are caught immediately:
      expect(() => new UserName('A')).toThrow('Name too short');
      expect(() => new Age(-5)).toThrow('Invalid age');
    });

    it('should show how types enable safe refactoring', () => {
      // ✓ Refactoring is safe with types
      interface User {
        id: string;
        name: string;
        email: string;
      }

      function getUserEmail(user: User): string {
        return user.email;
      }

      function getUserName(user: User): string {
        return user.name;
      }

      const user: User = { id: '1', name: 'Alice', email: 'alice@example.com' };

      expect(getUserEmail(user)).toBe('alice@example.com');
      expect(getUserName(user)).toBe('Alice');

      // If we change User interface, compiler catches all affected code
    });
  });

  describe('7. Checkpoint 🫵', () => {
    it('E.1: Explain why illegal states should be unrepresentable', () => {
      // Write your answer:
      // Making illegal states unrepresentable:
      // 1. Prevents bugs at compile-time, not runtime
      // 2. Makes code self-documenting - types show valid states
      // 3. Reduces testing burden - can't test invalid states
      // 4. Enables compiler optimizations - fewer checks needed
      // 5. Improves maintainability - refactoring is safer

      expect(true).toBe(true);
    });

    it('E.2: Design a type system for a payment status', () => {
      // Write your implementation:
      type PaymentStatus = 
        | { status: 'pending'; createdAt: Date }
        | { status: 'processing'; startedAt: Date }
        | { status: 'completed'; completedAt: Date; transactionId: string }
        | { status: 'failed'; failedAt: Date; reason: string };

      const pending: PaymentStatus = { status: 'pending', createdAt: new Date() };
      const completed: PaymentStatus = { status: 'completed', completedAt: new Date(), transactionId: '123' };

      expect(pending.status).toBe('pending');
      expect(completed.status).toBe('completed');
    });

    it('E.3: Compare null, exceptions, and Result types', () => {
      // Null: Implicit, causes runtime errors, easy to forget checks
      // Exceptions: Invisible in types, can be forgotten, hard to handle multiple errors
      // Result: Explicit, forces handling, can represent multiple error types

      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function safeDivide(a: number, b: number): Result<number, 'DivisionByZero'> {
        return b === 0
          ? { ok: false, error: 'DivisionByZero' }
          : { ok: true, value: a / b };
      }

      const result = safeDivide(10, 2);
      expect(result.ok).toBe(true);
    });

    it('E.4: Implement Option and Result helpers', () => {
      // Write your implementation:
      type Option<T> = { isSome: true; value: T } | { isSome: false };
      type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

      function some<T>(value: T): Option<T> {
        return { isSome: true, value };
      }

      function none<T>(): Option<T> {
        return { isSome: false };
      }

      function ok<T, E>(value: T): Result<T, E> {
        return { ok: true, value };
      }

      function error<T, E>(err: E): Result<T, E> {
        return { ok: false, error: err };
      }

      const opt = some(42);
      const res = ok<number, string>(42);

      expect(opt.isSome).toBe(true);
      expect(res.ok).toBe(true);
    });
  });
});
