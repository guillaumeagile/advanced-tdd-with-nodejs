# Chapter A Section 02: Classes and Inheritance as Types

## Classes as Types

A **class** is a type. When you define a class, you're defining:
1. A set of valid values (instances of the class)
2. A set of valid operations (methods on the class)
3. A contract that instances must fulfill

```typescript
// Defining a class is defining a type
class User {
  constructor(readonly name: string, readonly email: string) {}

  getDisplayName(): string {
    return this.name;
  }
}

// User is now a type
const user: User = new User('Alice', 'alice@example.com');

// The type User means:
// - Must have name and email properties
// - Must have getDisplayName() method
// - Must be created with new User(...)
```

## Instances and Type Checking

An **instance** is a value of a class type. TypeScript checks that instances have the correct shape:

```typescript
class User {
  constructor(readonly name: string, readonly email: string) {}
}

const user: User = new User('Alice', 'alice@example.com');

// TypeScript checks:
// ✓ user has name property (string)
// ✓ user has email property (string)
// ✓ user was created with User constructor

// This would be a type error:
// const invalid: User = { name: 'Bob', email: 'bob@example.com' }; // ✗ Not a User instance
```

## Inheritance and Type Hierarchies

**Inheritance** creates a hierarchy of types where a subclass is a type that extends a parent type.

```typescript
// Parent type
class Animal {
  constructor(readonly name: string) {}

  makeSound(): string {
    return 'Some sound';
  }
}

// Child type - extends parent
class Dog extends Animal {
  makeSound(): string {
    return 'Woof!';
  }

  fetch(): void {
    console.log(`${this.name} fetches the ball`);
  }
}

// Dog is a subtype of Animal
const dog: Dog = new Dog('Buddy');
const animal: Animal = dog; // ✓ Dog is assignable to Animal

// But not vice versa
// const d: Dog = animal; // ✗ Animal is not assignable to Dog
```

## Liskov Substitution Principle (LSP)

**LSP** states that a subtype must be substitutable for its parent type. This means:
- A subtype can be used anywhere the parent type is expected
- A subtype must not violate the contract of the parent type

```typescript
// Parent contract
class Shape {
  getArea(): number {
    return 0;
  }
}

// Valid subtype - fulfills contract
class Circle extends Shape {
  constructor(readonly radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

// Valid subtype - fulfills contract
class Rectangle extends Shape {
  constructor(readonly width: number, readonly height: number) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }
}

// Both can be used where Shape is expected
function printArea(shape: Shape) {
  console.log(shape.getArea());
}

printArea(new Circle(5));      // ✓ Works
printArea(new Rectangle(4, 5)); // ✓ Works
```

## Type Narrowing and Type Guards

**Type narrowing** is the process of refining a type to be more specific. **Type guards** are checks that narrow types.

```typescript
// Broad type
class Animal {
  constructor(readonly name: string) {}
  makeSound(): string { return 'Sound'; }
}

class Dog extends Animal {
  fetch(): void { console.log('Fetching'); }
}

class Cat extends Animal {
  scratch(): void { console.log('Scratching'); }
}

// Function that accepts Animal
function interact(animal: Animal) {
  // At this point, animal could be Dog or Cat
  // We need to narrow the type to use specific methods

  // Type guard: instanceof
  if (animal instanceof Dog) {
    animal.fetch(); // ✓ Now we know it's a Dog
  } else if (animal instanceof Cat) {
    animal.scratch(); // ✓ Now we know it's a Cat
  }
}

// Type guard: property check
function getSound(animal: Animal): string {
  if ('fetch' in animal) {
    // animal has fetch method, so it's a Dog
    return 'Woof!';
  }
  return animal.makeSound();
}
```

## The Cast Mechanism

A **cast** (or type assertion) tells TypeScript "I know the type better than you do, trust me." Casts are written with `as`:

```typescript
// Cast syntax
const value: unknown = 'Hello';
const str: string = value as string; // Cast unknown to string

// Casts are type-level only
// They don't change the value at runtime
const num: number = 5;
const str2: string = num as unknown as string; // ✗ Dangerous!
```

### When to Use Casts

**Casts should be rare.** They bypass type safety. Use them only when:
1. You have information TypeScript doesn't have
2. You've verified the value is actually the right type
3. You can't express the type any other way

```typescript
// ✓ Good use of cast - you know the type
const element = document.getElementById('my-input');
const input = element as HTMLInputElement; // You know it's an input
input.value = 'Hello';

// ✗ Bad use of cast - bypasses safety
const user: User = someValue as User; // Dangerous! someValue might not be a User

// ✓ Better - use type guards
function isUser(value: unknown): value is User {
  return value instanceof User;
}

if (isUser(someValue)) {
  // Now we know someValue is a User
}
```

### Type Predicates

A **type predicate** is a function that narrows types. It's more type-safe than casts:

```typescript
// Type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(value: unknown): value is User {
  return value instanceof User;
}

// Usage
const value: unknown = 'Hello';
if (isString(value)) {
  // value is now string
  console.log(value.toUpperCase());
}

// With classes
const something: unknown = new User('Alice', 'alice@example.com');
if (isUser(something)) {
  // something is now User
  console.log(something.name);
}
```

## Abstract Classes

An **abstract class** is a class that can't be instantiated directly. It defines a contract that subclasses must implement:

```typescript
// Abstract class - can't be instantiated
abstract class Vehicle {
  constructor(readonly brand: string) {}

  // Abstract method - must be implemented by subclasses
  abstract getSpeed(): number;

  // Concrete method - can be used by all subclasses
  describe(): string {
    return `${this.brand} vehicle`;
  }
}

// ✗ Can't instantiate abstract class
// const v = new Vehicle('Toyota'); // ✗ Type error

// ✓ Can create subclass
class Car extends Vehicle {
  getSpeed(): number {
    return 200; // km/h
  }
}

const car: Vehicle = new Car('Toyota'); // ✓ Works
console.log(car.getSpeed()); // 200
```

## Polymorphism

**Polymorphism** means "many forms." It allows you to write code that works with parent types but behaves differently based on the actual subtype:

```typescript
// Parent type
abstract class Animal {
  constructor(readonly name: string) {}
  abstract makeSound(): string;
}

// Subtypes
class Dog extends Animal {
  makeSound(): string { return 'Woof!'; }
}

class Cat extends Animal {
  makeSound(): string { return 'Meow!'; }
}

class Bird extends Animal {
  makeSound(): string { return 'Tweet!'; }
}

// Polymorphic function - works with any Animal
function animalConcert(animals: Animal[]) {
  for (const animal of animals) {
    console.log(`${animal.name}: ${animal.makeSound()}`);
  }
}

// Different behavior based on actual type
animalConcert([
  new Dog('Buddy'),
  new Cat('Whiskers'),
  new Bird('Tweety')
]);
// Output:
// Buddy: Woof!
// Whiskers: Meow!
// Tweety: Tweet!
```

## Classes vs. Interfaces

**Classes** define both type and implementation. **Interfaces** define only type (contract):

```typescript
// Interface - only defines contract
interface Animal {
  name: string;
  makeSound(): string;
}

// Class - defines contract and implementation
class Dog implements Animal {
  constructor(readonly name: string) {}

  makeSound(): string {
    return 'Woof!';
  }
}

// Both can be used as types
const dog1: Animal = new Dog('Buddy');
const dog2: Dog = new Dog('Max');

// But only Dog has the implementation
const dog3: Animal = { name: 'Spot', makeSound: () => 'Woof!' };
```

## Duck Typing: TypeScript's Structural Approach

**Duck typing** is a typing philosophy: "If it walks like a duck and quacks like a duck, it's a duck." TypeScript uses **structural typing** (duck typing), which differs from **nominal typing** used in other OO languages.

### Structural Typing (Duck Typing) - TypeScript

In TypeScript, types are determined by **shape**, not by name or explicit declaration:

```typescript
// Define a type by shape, not by name
interface Logger {
  log(message: string): void;
}

// This class doesn't explicitly implement Logger
class ConsoleLogger {
  log(message: string) {
    console.log(message);
  }
}

// But it's assignable to Logger because it has the same shape
const logger: Logger = new ConsoleLogger(); // ✓ Works!

// Even a plain object works if it has the right shape
const plainLogger: Logger = {
  log: (message: string) => console.log(message)
}; // ✓ Works!
```

### Nominal Typing - Other OO Languages

In languages like Java, C#, and Python, types are determined by **name** and **explicit declaration**:

```java
// Java - Nominal Typing
interface Logger {
  void log(String message);
}

// Must explicitly implement Logger
class ConsoleLogger implements Logger {
  public void log(String message) {
    System.out.println(message);
  }
}

// This would NOT work in Java:
class MyLogger {
  public void log(String message) {
    System.out.println(message);
  }
}

Logger logger = new MyLogger(); // ✗ Type error - MyLogger doesn't explicitly implement Logger
```

### Comparison: Structural vs. Nominal

| Aspect | Structural (TypeScript) | Nominal (Java, C#) |
|--------|------------------------|-------------------|
| **Type Checking** | Based on shape | Based on name/declaration |
| **Flexibility** | High - any shape works | Low - must explicitly implement |
| **Refactoring** | Easier - no explicit declarations | Harder - must update declarations |
| **Accidental Compatibility** | Possible - shapes might match | Impossible - must be explicit |
| **Error Messages** | Shape mismatch | Name mismatch |

### Benefits of Structural Typing

1. **Flexibility** - Any object with the right shape works
2. **Less Boilerplate** - No need for explicit `implements`
3. **Easier Refactoring** - Change implementation without updating declarations
4. **Better Composition** - Mix and match objects freely

```typescript
// Structural typing enables flexible composition
interface Drawable {
  draw(): void;
}

interface Erasable {
  erase(): void;
}

class Pencil {
  draw() { console.log('Drawing'); }
  erase() { console.log('Erasing'); }
}

// Pencil works as both Drawable and Erasable
const drawable: Drawable = new Pencil();
const erasable: Erasable = new Pencil();
```

### Downsides of Structural Typing

1. **Accidental Compatibility** - Unrelated types might match by accident
2. **Less Explicit** - Intent is not as clear
3. **Harder to Debug** - Shape mismatches can be subtle

```typescript
// Accidental compatibility - both have same shape
type UserId = string;
type Email = string;

const userId: UserId = 'user123';
const email: Email = userId; // ✓ Works but semantically wrong!

// Better - use branded types to prevent this
type UserId = string & { readonly __brand: 'UserId' };
type Email = string & { readonly __brand: 'Email' };

const userId: UserId = 'user123' as UserId;
const email: Email = userId; // ✗ Type error - prevents accidental mixing
```

## Branded Types: Preventing Accidental Compatibility

**Branded types** (also called "opaque types" or "phantom types") solve the accidental compatibility problem by adding a unique "brand" property that distinguishes semantically different types, even if they have the same underlying shape.

### The Problem: Accidental Mixing

```typescript
// Without branding - easy to mix up
type OrderId = string;
type UserId = string;
type ProductId = string;

function processOrder(orderId: OrderId, userId: UserId) {
  // ...
}

const orderId: OrderId = 'ORD-001';
const userId: UserId = 'USER-123';
const productId: ProductId = 'PROD-456';

processOrder(orderId, userId); // ✓ Correct
processOrder(userId, orderId); // ✓ Also works! (but semantically wrong)
processOrder(productId, userId); // ✓ Also works! (but semantically wrong)
```

All three are just strings, so TypeScript can't distinguish them.

### The Solution: Branded Types

```typescript
// With branding - prevents accidental mixing
type OrderId = string & { readonly __brand: 'OrderId' };
type UserId = string & { readonly __brand: 'UserId' };
type ProductId = string & { readonly __brand: 'ProductId' };

function processOrder(orderId: OrderId, userId: UserId) {
  // ...
}

const orderId: OrderId = 'ORD-001' as OrderId;
const userId: UserId = 'USER-123' as UserId;
const productId: ProductId = 'PROD-456' as ProductId;

processOrder(orderId, userId); // ✓ Correct
processOrder(userId, orderId); // ✗ Type error - UserId is not OrderId
processOrder(productId, userId); // ✗ Type error - ProductId is not UserId
```

### How Branded Types Work

A branded type is a type alias that combines:
1. **A base type** (string, number, etc.)
2. **A unique brand property** (a phantom property that only exists in the type system)

```typescript
// Generic branded type helper
type Brand<T, B> = T & { readonly __brand: B };

// Create branded types
type OrderId = Brand<string, 'OrderId'>;
type UserId = Brand<string, 'UserId'>;
type Email = Brand<string, 'Email'>;
type PositiveNumber = Brand<number, 'PositiveNumber'>;

// Helper function to create branded values
function createOrderId(value: string): OrderId {
  return value as OrderId;
}

function createUserId(value: string): UserId {
  return value as UserId;
}

// Usage
const orderId = createOrderId('ORD-001');
const userId = createUserId('USER-123');

// These are now type-safe
function shipOrder(orderId: OrderId, userId: UserId) {
  console.log(`Shipping order ${orderId} for user ${userId}`);
}

shipOrder(orderId, userId); // ✓ Correct
shipOrder(userId, orderId); // ✗ Type error
```

### Real-World Example: E-Commerce Domain

```typescript
// Define branded types for domain identifiers
type OrderId = Brand<string, 'OrderId'>;
type CustomerId = Brand<string, 'CustomerId'>;
type ProductId = Brand<string, 'ProductId'>;
type Email = Brand<string, 'Email'>;

// Define branded types for validated values
type PositiveNumber = Brand<number, 'PositiveNumber'>;
type ValidEmail = Brand<string, 'ValidEmail'>;

// Helper functions to create branded values
function createOrderId(value: string): OrderId {
  if (!value.startsWith('ORD-')) {
    throw new Error('Invalid order ID format');
  }
  return value as OrderId;
}

function createEmail(value: string): ValidEmail {
  if (!value.includes('@')) {
    throw new Error('Invalid email format');
  }
  return value as ValidEmail;
}

function createPositiveNumber(value: number): PositiveNumber {
  if (value <= 0) {
    throw new Error('Must be positive');
  }
  return value as PositiveNumber;
}

// Domain functions use branded types
function createOrder(orderId: OrderId, customerId: CustomerId, amount: PositiveNumber) {
  return {
    orderId,
    customerId,
    amount,
    createdAt: new Date()
  };
}

function sendConfirmation(email: ValidEmail, orderId: OrderId) {
  console.log(`Sending confirmation to ${email} for order ${orderId}`);
}

// Usage
const orderId = createOrderId('ORD-001');
const customerId = 'CUST-123' as CustomerId;
const email = createEmail('alice@example.com');
const amount = createPositiveNumber(99.99);

createOrder(orderId, customerId, amount); // ✓ Type-safe
sendConfirmation(email, orderId); // ✓ Type-safe

// These would be type errors:
// createOrder(customerId, orderId, amount); // ✗ Wrong order
// sendConfirmation(orderId, email); // ✗ Wrong order
// createPositiveNumber(-50); // ✗ Runtime error (validation fails)
```

### When to Use Branded Types

**Use branded types when:**
1. You have multiple types with the same underlying shape (multiple string IDs)
2. You want to prevent accidental parameter swapping
3. You need semantic distinction between similar values
4. You're building a domain model with strong typing

**Don't use branded types when:**
1. The distinction is obvious from context
2. You're dealing with a single type (just one UserId in your app)
3. The overhead isn't worth the safety gain

### Comparison: Branded Types vs. Classes

```typescript
// Branded type approach - lightweight
type UserId = Brand<string, 'UserId'>;
const userId = 'user123' as UserId;

// Class approach - more heavyweight
class UserId {
  constructor(readonly value: string) {
    if (!value) throw new Error('UserId cannot be empty');
  }
}
const userId = new UserId('user123');

// Both prevent accidental mixing, but:
// - Branded types: lighter, simpler, no runtime overhead
// - Classes: heavier, can add validation logic, more explicit
```

### When Structural Typing Matters

**Structural typing is most useful when:**
- Working with multiple libraries that define similar types
- Creating flexible, composable APIs
- Avoiding tight coupling to specific implementations

**Nominal typing would be better when:**
- You want to prevent accidental type mixing
- You need explicit intent in the code
- You're working in a team where clarity is important

### TypeScript's Hybrid Approach

TypeScript allows both structural and nominal typing:

```typescript
// Structural - any shape works
interface Reader {
  read(): string;
}

const reader: Reader = {
  read: () => 'content'
}; // ✓ Works

// Nominal - explicit declaration
class FileReader implements Reader {
  read(): string {
    return 'file content';
  }
}

const fileReader: Reader = new FileReader(); // ✓ Works

// Branded types - nominal-like behavior
type FileId = string & { readonly __brand: 'FileId' };
type UserId = string & { readonly __brand: 'UserId' };

const fileId: FileId = 'file123' as FileId;
const userId: UserId = fileId; // ✗ Type error - prevents mixing
```

## Key Takeaways

- **Classes are types** - They define valid values and operations
- **Inheritance creates type hierarchies** - Subtypes can be used where parent types are expected
- **Liskov Substitution Principle** - Subtypes must fulfill parent contracts
- **Type narrowing** - Refine broad types to specific types
- **Type guards** - Use `instanceof` or type predicates to narrow types
- **Casts are dangerous** - Use them rarely and only when necessary
- **Type predicates are safer** - They narrow types without bypassing safety
- **Abstract classes** - Define contracts that subclasses must implement
- **Polymorphism** - Write code that works with parent types but behaves differently based on actual types
- **Classes vs. Interfaces** - Classes have implementation, interfaces are contracts only
- **Structural typing (Duck Typing)** - TypeScript checks shape, not name - differs from nominal typing in Java/C#
- **Flexibility vs. Clarity** - Structural typing is flexible but can cause accidental compatibility
- **Branded types** - Use to add nominal-like safety to TypeScript's structural typing

---

**Next: [Working Examples](./02-classes-inheritance.test.ts)**
