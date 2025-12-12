# Chapter C: Strong Typing & Clean Code

## Primitive Obsession Anti-Pattern

**Primitive Obsession** is using primitive types (`string`, `number`, `boolean`) instead of creating domain types.

```typescript
// ✗ Primitive Obsession
function createUser(name: string, email: string, age: number) {
  // What constraints apply to these strings and numbers?
  // Can age be negative? Can email be empty?
  // Easy to pass parameters in wrong order
  return { name, email, age };
}

createUser('alice@example.com', 'Alice', 30); // ✗ Wrong order, no error!

// ✓ Domain Types
type Email = string;
type UserName = string;
type Age = number;

function createUser(name: UserName, email: Email, age: Age) {
  // Still not ideal - no validation
  return { name, email, age };
}

// ✓ Value Objects
class Email {
  constructor(readonly value: string) {
    if (!value.includes('@')) throw new Error('Invalid email');
  }
}

class UserName {
  constructor(readonly value: string) {
    if (value.length < 2) throw new Error('Name too short');
  }
}

function createUser(name: UserName, email: Email, age: number) {
  // Now we have validation and type safety
  return { name, email, age };
}
```

## Value Objects

A **Value Object** is a small, immutable object that represents a concept in your domain.

```typescript
// Value Object: Email
class Email {
  readonly value: string;

  constructor(value: string) {
    if (!value.includes('@')) {
      throw new Error('Invalid email format');
    }
    this.value = value.toLowerCase();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Value Object: Money
class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    this.amount = amount;
    this.currency = currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

## Anemic Objects Anti-Pattern

An **Anemic Object** is a class with only data (getters/setters) and no behavior.

```typescript
// ✗ Anemic Object - just a data container
class User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;

  constructor(id: string, name: string, email: string, isActive: boolean) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = isActive;
  }
}

// Business logic lives elsewhere (bad!)
function deactivateUser(user: User) {
  user.isActive = false;
}

function sendWelcomeEmail(user: User) {
  // Send email to user.email
}

// ✓ Rich Object - data and behavior together
class User {
  private id: string;
  private name: string;
  private email: Email;
  private isActive: boolean;

  constructor(id: string, name: string, email: Email) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  getEmail(): Email {
    return this.email;
  }

  isDeactivated(): boolean {
    return !this.isActive;
  }
}
```

## Single Responsibility Principle (SRP)

**SRP** states that a class should have only one reason to change.

```typescript
// ✗ Violates SRP - multiple reasons to change
class User {
  name: string;
  email: string;

  // Reason 1: User data changes
  updateEmail(email: string) {
    this.email = email;
  }

  // Reason 2: Email sending logic changes
  sendWelcomeEmail() {
    // Send email
  }

  // Reason 3: Database logic changes
  save() {
    // Save to database
  }
}

// ✓ Follows SRP - one reason to change
class User {
  constructor(readonly name: string, readonly email: Email) {}
}

class EmailService {
  sendWelcomeEmail(user: User) {
    // Send email
  }
}

class UserRepository {
  save(user: User) {
    // Save to database
  }
}
```

## Domain-Driven Design (DDD) Through Types

Types should **reveal your domain** - they should make business concepts explicit.

```typescript
// ✗ Generic types - unclear intent
function processOrder(id: string, items: any[], total: number) {
  // What is id? What is items? What is total?
}

// ✓ Domain types - clear intent
type OrderId = string;
type OrderItem = { productId: string; quantity: number; price: Money };
type OrderTotal = Money;

function processOrder(id: OrderId, items: OrderItem[], total: OrderTotal) {
  // Clear what each parameter represents
}

// ✓ Even better - use classes
class Order {
  constructor(
    readonly id: OrderId,
    readonly items: OrderItem[],
    readonly total: OrderTotal
  ) {}

  addItem(item: OrderItem) {
    // Business logic for adding items
  }

  calculateTotal(): OrderTotal {
    // Business logic for calculating total
  }
}
```

## Fine-Grained vs. Broad Types

**Fine-grained types** are specific to your domain. **Broad types** are generic.

```typescript
// ✗ Broad types - too generic
function createUser(id: string, name: string, email: string) {
  // Easy to mix up parameters
  return { id, name, email };
}

// ✓ Fine-grained types - specific to domain
type UserId = string & { readonly __brand: 'UserId' };
type Email = string & { readonly __brand: 'Email' };
type UserName = string & { readonly __brand: 'UserName' };

function createUser(id: UserId, name: UserName, email: Email) {
  // Impossible to mix up parameters
  return { id, name, email };
}

// ✓ Even better - use classes
class UserId {
  constructor(readonly value: string) {}
}

class Email {
  constructor(readonly value: string) {
    if (!value.includes('@')) throw new Error('Invalid email');
  }
}

class UserName {
  constructor(readonly value: string) {
    if (value.length < 2) throw new Error('Name too short');
  }
}
```

## Restrictive Types

Be **restrictive** with your types - make invalid states impossible.

```typescript
// ✗ Permissive - allows invalid states
type User = {
  name: string;      // Can be empty
  age: number;       // Can be negative
  email: string;     // Can be invalid
  status: string;    // Can be any string
};

// ✓ Restrictive - prevents invalid states
type UserStatus = 'active' | 'inactive' | 'suspended';

class User {
  constructor(
    readonly name: UserName,    // Must be valid
    readonly age: Age,          // Must be positive
    readonly email: Email,      // Must be valid
    readonly status: UserStatus // Must be one of three values
  ) {}
}
```

## SOLID Principles Applied

### Single Responsibility
Each class has one reason to change.

### Open/Closed
Classes are open for extension, closed for modification (use inheritance/composition).

### Liskov Substitution
Subtypes must be substitutable for their base types.

### Interface Segregation
Depend on specific interfaces, not broad ones.

### Dependency Inversion
Depend on abstractions, not concrete implementations.

---

**Next: [Working Examples](./01-value-objects.test.ts)**
