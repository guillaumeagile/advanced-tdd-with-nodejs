# Chapter D: Honest Functions with Types

## Pure Functions

A **pure function** is a function that:
1. Always returns the same output for the same input
2. Has no side effects (doesn't modify external state)
3. Doesn't depend on external state

```typescript
// ✗ Impure - depends on external state
let count = 0;
function increment() {
  count++; // Side effect: modifies external state
  return count;
}

// ✗ Impure - has side effects
function saveUser(user: User) {
  console.log(user); // Side effect: logs to console
  database.insert(user); // Side effect: modifies database
  sendEmail(user.email); // Side effect: sends email
  return user;
}

// ✓ Pure - no side effects, deterministic
function add(a: number, b: number): number {
  return a + b;
}

// ✓ Pure - no external dependencies
function isValidEmail(email: string): boolean {
  return email.includes('@');
}

// ✓ Pure - returns new object, doesn't modify input
function addItem(items: Item[], newItem: Item): Item[] {
  return [...items, newItem]; // Creates new array
}
```

## Input Types as Contracts

Input types define **what the function expects** and **what it promises to work with**.

```typescript
// ✗ Unclear what the function expects
function processData(data: any) {
  return data.name + data.age;
}

// ✓ Clear contract - function expects a User
interface User {
  name: string;
  age: number;
}

function processUser(user: User): string {
  return user.name + user.age;
}

// ✓ Even better - use semantic types
class User {
  constructor(readonly name: UserName, readonly age: Age) {}
}

function processUser(user: User): string {
  return user.name.value + user.age.value;
}
```

## Output Types as Promises

Output types define **what the function guarantees to return**.

```typescript
// ✗ Unclear what the function returns
function findUser(id: string) {
  // Returns User or null? Or throws?
}

// ✓ Clear - function returns User or null
function findUser(id: string): User | null {
  // Caller knows to check for null
}

// ✓ Even better - use Result type
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function findUser(id: string): Result<User, 'NotFound'> {
  // Caller must handle both success and failure
}

// ✓ Or use Option type
type Option<T> = { isSome: true; value: T } | { isSome: false };

function findUser(id: string): Option<User> {
  // Caller must check isSome before accessing value
}
```

## Semantic Types

**Semantic types** encode meaning in the type system, making intent clear.

```typescript
// ✗ Generic types - unclear intent
function calculateDiscount(price: number, discount: number): number {
  return price * (1 - discount);
}

// ✓ Semantic types - clear intent
type Price = number;
type DiscountRate = number; // 0.0 to 1.0

function calculateDiscount(price: Price, discount: DiscountRate): Price {
  return price * (1 - discount);
}

// ✓ Even better - use classes with validation
class Price {
  constructor(readonly value: number) {
    if (value < 0) throw new Error('Price cannot be negative');
  }
}

class DiscountRate {
  constructor(readonly value: number) {
    if (value < 0 || value > 1) throw new Error('Discount must be 0-1');
  }
}

function calculateDiscount(price: Price, discount: DiscountRate): Price {
  return new Price(price.value * (1 - discount.value));
}
```

## Type-Driven Function Design

Let the **types guide the implementation**. Types reveal what the function should do.

```typescript
// Type tells us what the function must do
function findById(id: UserId, repository: Repository<User>): Option<User> {
  // Must return Option<User>
  // Must use the repository to find the user
  // Must handle the case where user is not found
}

// Type tells us the function is pure
function calculateTotal(items: OrderItem[]): Money {
  // Must return a Money (not null, not undefined)
  // Must not modify items
  // Must not have side effects
}

// Type tells us the function might fail
function createUser(email: Email): Result<User, 'EmailAlreadyExists'> {
  // Must return Result
  // Must handle the case where email already exists
  // Must not throw exceptions
}
```

## Composability Through Types

Types enable **function composition** - combining functions safely.

```typescript
// Functions with clear input/output types compose well
function getUserEmail(user: User): Email {
  return user.email;
}

function normalizeEmail(email: Email): NormalizedEmail {
  return new NormalizedEmail(email.value.toLowerCase());
}

function isBlacklisted(email: NormalizedEmail, blacklist: Set<NormalizedEmail>): boolean {
  return blacklist.has(email);
}

// Compose functions
const user = new User('Alice', new Email('Alice@Example.com'));
const email = getUserEmail(user);
const normalized = normalizeEmail(email);
const blocked = isBlacklisted(normalized, blacklist);

// Or use pipe/compose utilities
const isUserBlacklisted = pipe(
  getUserEmail,
  normalizeEmail,
  (email) => isBlacklisted(email, blacklist)
);
```

## Honest Functions

An **honest function** is one where the type signature tells the complete truth about what the function does.

```typescript
// ✗ Dishonest - type says it returns User, but might return null
function getUser(id: string): User {
  const user = database.find(id);
  return user; // Might be null!
}

// ✓ Honest - type tells the truth
function getUser(id: string): User | null {
  const user = database.find(id);
  return user;
}

// ✗ Dishonest - type says it's pure, but has side effects
function processOrder(order: Order): OrderConfirmation {
  sendEmail(order.customer.email); // Side effect!
  return new OrderConfirmation(order.id);
}

// ✓ Honest - type reveals side effects through dependencies
function processOrder(
  order: Order,
  emailService: EmailService
): OrderConfirmation {
  emailService.send(order.customer.email, 'Order confirmed');
  return new OrderConfirmation(order.id);
}

// ✗ Dishonest - type says it returns User, but might throw
function createUser(email: Email): User {
  if (userExists(email)) {
    throw new Error('User already exists'); // Surprise!
  }
  return new User(email);
}

// ✓ Honest - type reveals possibility of failure
function createUser(email: Email): Result<User, 'UserAlreadyExists'> {
  if (userExists(email)) {
    return { ok: false, error: 'UserAlreadyExists' };
  }
  return { ok: true, value: new User(email) };
}
```

## Key Takeaways

- **Pure functions** are predictable and testable
- **Input types** define what the function expects
- **Output types** define what the function guarantees
- **Semantic types** encode domain meaning
- **Type-driven design** lets types guide implementation
- **Composability** comes from clear input/output types
- **Honest functions** tell the truth in their type signature

---

**Next: [Working Examples](./01-pure-functions.test.ts)**
