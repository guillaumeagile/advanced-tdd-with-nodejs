# Chapter E: Type Safety & Feedback

## Making Illegal States Unrepresentable

The goal of type design is to make **illegal states impossible to represent**.

```typescript
// ✗ Illegal states are possible
type User = {
  id: string;
  name: string;
  email: string;
  status: string; // Can be any string!
  isActive: boolean;
  isDeleted: boolean; // Both can be true!
};

// Illegal states:
const user1: User = { id: '1', name: 'Alice', email: '', status: 'invalid', isActive: true, isDeleted: true };

// ✓ Illegal states are impossible
type UserStatus = 'active' | 'inactive' | 'suspended';

type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus; // Only valid values
};

// Can't represent both active and deleted
// Can't have invalid status
```

## The Problem with Null

**Null** is a billion-dollar mistake. It represents "no value" but:
- Causes runtime errors (null pointer exceptions)
- Is not explicit in types
- Makes error handling implicit

```typescript
// ✗ Null is implicit
function findUser(id: string): User | null {
  // Caller might forget to check for null
  const user = database.find(id);
  return user;
}

const user = findUser('123');
console.log(user.name); // ✗ Might crash if user is null

// ✓ Explicit with Option type
type Option<T> = { isSome: true; value: T } | { isSome: false };

function findUser(id: string): Option<User> {
  const user = database.find(id);
  return user ? { isSome: true, value: user } : { isSome: false };
}

const result = findUser('123');
if (result.isSome) {
  console.log(result.value.name); // Safe
}
```

## The Problem with Exceptions

**Exceptions** are not types. They:
- Are invisible in function signatures
- Make error handling implicit
- Can be forgotten or ignored
- Make functions dishonest

```typescript
// ✗ Exceptions are invisible
function createUser(email: string): User {
  if (userExists(email)) {
    throw new Error('User already exists'); // Hidden!
  }
  return new User(email);
}

// Caller doesn't know this might throw
const user = createUser('alice@example.com');

// ✓ Result type makes errors explicit
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function createUser(email: string): Result<User, 'UserAlreadyExists'> {
  if (userExists(email)) {
    return { ok: false, error: 'UserAlreadyExists' };
  }
  return { ok: true, value: new User(email) };
}

// Caller must handle both cases
const result = createUser('alice@example.com');
if (result.ok) {
  console.log(result.value);
} else {
  console.log('Error:', result.error);
}
```

## Option Type

**Option** (or Maybe) represents a value that might not exist.

```typescript
type Option<T> = { isSome: true; value: T } | { isSome: false };

// Or using discriminated unions:
type Option<T> = 
  | { kind: 'some'; value: T }
  | { kind: 'none' };

// Helper functions
function some<T>(value: T): Option<T> {
  return { isSome: true, value };
}

function none<T>(): Option<T> {
  return { isSome: false };
}

// Usage
function findUser(id: string): Option<User> {
  if (id === '1') {
    return some(new User('1', 'Alice'));
  }
  return none();
}

// Chaining operations
function getUserEmail(id: string): Option<string> {
  const userOpt = findUser(id);
  if (userOpt.isSome) {
    return some(userOpt.value.email);
  }
  return none();
}
```

## Result Type

**Result** (or Either) represents a computation that might fail.

```typescript
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

// Or using discriminated unions:
type Result<T, E> = 
  | { kind: 'ok'; value: T }
  | { kind: 'error'; error: E };

// Helper functions
function ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}

function error<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

// Usage
function createUser(email: string): Result<User, 'InvalidEmail' | 'UserAlreadyExists'> {
  if (!email.includes('@')) {
    return error('InvalidEmail');
  }
  if (userExists(email)) {
    return error('UserAlreadyExists');
  }
  return ok(new User(email));
}

// Handling results
const result = createUser('alice@example.com');
if (result.ok) {
  console.log('User created:', result.value);
} else {
  console.log('Error:', result.error);
}
```

## Monads as Type-Safe Abstractions

A **monad** is a pattern for composing operations that might fail or return optional values.

```typescript
// Option monad
type Option<T> = { isSome: true; value: T } | { isSome: false };

function map<T, U>(opt: Option<T>, f: (t: T) => U): Option<U> {
  return opt.isSome ? { isSome: true, value: f(opt.value) } : { isSome: false };
}

function flatMap<T, U>(opt: Option<T>, f: (t: T) => Option<U>): Option<U> {
  return opt.isSome ? f(opt.value) : { isSome: false };
}

// Usage
const userOpt = findUser('1');
const emailOpt = map(userOpt, (user) => user.email);
const domainOpt = flatMap(emailOpt, (email) => extractDomain(email));

// Result monad
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function mapResult<T, U, E>(res: Result<T, E>, f: (t: T) => U): Result<U, E> {
  return res.ok ? { ok: true, value: f(res.value) } : { ok: false, error: res.error };
}

function flatMapResult<T, U, E>(res: Result<T, E>, f: (t: T) => Result<U, E>): Result<U, E> {
  return res.ok ? f(res.value) : { ok: false, error: res.error };
}

// Usage
const userRes = createUser('alice@example.com');
const emailRes = mapResult(userRes, (user) => user.email);
const validatedRes = flatMapResult(emailRes, (email) => validateEmail(email));
```

## Fast Feedback Loops

Types provide the **fastest feedback**:

1. **Compile-time errors** - Caught before running code
2. **Type inference** - IDE shows types as you type
3. **Autocomplete** - IDE suggests valid operations
4. **Refactoring safety** - Compiler catches breaking changes

```typescript
// Without types - feedback is slow
function processUser(data) {
  return data.name + data.age; // Might crash at runtime
}

// With types - feedback is fast
interface User {
  name: string;
  age: number;
}

function processUser(user: User): string {
  return user.name + user.age; // Error caught immediately if User shape changes
}

// With semantic types - feedback is even faster
class User {
  constructor(readonly name: UserName, readonly age: Age) {}
}

function processUser(user: User): string {
  return user.name.value + user.age.value; // Refactoring is safe
}
```

## Type Safety Benefits

| Aspect | Without Types | With Types |
|--------|---------------|-----------|
| **Error Detection** | Runtime | Compile-time |
| **Feedback Speed** | Slow (run tests) | Fast (IDE) |
| **Refactoring** | Risky | Safe |
| **Documentation** | Implicit | Explicit |
| **IDE Support** | Limited | Full |
| **Composability** | Hard | Easy |

---

**Next: [Working Examples](./01-type-safety.test.ts)**
