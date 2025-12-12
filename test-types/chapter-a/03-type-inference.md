# Chapter A Section 03: Type Inference

## Overview

TypeScript can **automatically determine types** from the values you assign. This is called **type inference**. Understanding when and how TypeScript infers types helps you write cleaner code while maintaining type safety.

## What is Type Inference?

Type inference is when TypeScript **figures out the type** without you explicitly writing it:

```typescript
// You write:
const age = 30;

// TypeScript infers:
const age: number = 30;
```

## When TypeScript Infers Types

### 1. Variable Initialization

When you assign a value to a variable, TypeScript infers the type from that value:

```typescript
const name = "Alice";           // ✓ Inferred as string
const age = 30;                 // ✓ Inferred as number
const active = true;            // ✓ Inferred as boolean
const price = 99.99;            // ✓ Inferred as number
const items = [1, 2, 3];        // ✓ Inferred as number[]
```

### 2. Function Return Types

TypeScript infers the return type from the return statements:

```typescript
function add(a: number, b: number) {
  return a + b;                 // ✓ Return type inferred as number
}

function greet(name: string) {
  return `Hello, ${name}`;      // ✓ Return type inferred as string
}

function isActive(user: { active: boolean }) {
  return user.active;           // ✓ Return type inferred as boolean
}
```

### 3. Object Literals

TypeScript infers the shape of objects:

```typescript
const user = {
  name: "Alice",                // ✓ name: string
  age: 30,                      // ✓ age: number
  email: "alice@example.com"    // ✓ email: string
};

// TypeScript infers:
// const user: {
//   name: string;
//   age: number;
//   email: string;
// }
```

### 4. Array Types

TypeScript infers array element types:

```typescript
const numbers = [1, 2, 3];                    // ✓ number[]
const strings = ["a", "b", "c"];              // ✓ string[]
const mixed = [1, "two", true];               // ✓ (number | string | boolean)[]
```

### 5. Conditional Expressions

TypeScript infers union types from conditionals:

```typescript
const result = someCondition ? 42 : "error";  // ✓ number | string
```

## When TypeScript Cannot Infer

### 1. Empty Collections

Without initial values, TypeScript can't infer the element type:

```typescript
const items = [];               // ✗ Inferred as any[] (not safe)
const items: number[] = [];     // ✓ Explicit annotation needed
```

### 2. Function Parameters

Function parameters are **never inferred** - you must always specify them:

```typescript
function add(a, b) {            // ✗ a and b are any
  return a + b;
}

function add(a: number, b: number) { // ✓ Parameters must be explicit
  return a + b;
}
```

### 3. Complex Expressions

Sometimes TypeScript needs help with complex logic:

```typescript
// Ambiguous - TypeScript might infer unknown or any
const value = complexLogic ? getValue1() : getValue2();

// Better - be explicit
const value: string = complexLogic ? getValue1() : getValue2();
```

## Best Practices for Type Inference

### ✅ Let TypeScript Infer When:

1. **Initializing variables with clear values**
```typescript
const age = 30;                 // ✓ Obviously a number
const name = "Alice";           // ✓ Obviously a string
```

2. **Function return types are obvious**
```typescript
function double(n: number) {
  return n * 2;                 // ✓ Obviously returns number
}
```

3. **Working with object literals**
```typescript
const user = { name: "Alice", age: 30 }; // ✓ Shape is clear
```

### ❌ Always Explicitly Annotate:

1. **Function parameters** (required by TypeScript)
```typescript
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

2. **Public API boundaries**
```typescript
export function processOrder(order: Order): Result<OrderConfirmation> {
  // ...
}
```

3. **Empty collections**
```typescript
const orders: Order[] = [];
const statusMap: Map<string, OrderStatus> = new Map();
```

4. **Complex or ambiguous types**
```typescript
const handler: (event: Event) => void = (e) => {
  // ...
};
```

## Inference in Practice

### Good Balance - Inference + Explicit

```typescript
// Domain model
interface Order {
  id: string;
  status: OrderStatus;
  total: number;
}

// Function with explicit parameters and inferred return
function createOrder(id: string, status: OrderStatus, total: number) {
  return { id, status, total };  // ✓ Return type inferred as Order
}

// Variable with inferred type
const order = createOrder("ORD-001", "pending", 99.99);
// ✓ order is inferred as { id: string; status: OrderStatus; total: number }

// Array with explicit type
const orders: Order[] = [];
orders.push(order);  // ✓ Type-safe
```

### Inference Helps Reduce Boilerplate

```typescript
// Without inference (verbose)
const user: { name: string; age: number; email: string } = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
};

// With inference (clean)
const user = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
};
// ✓ Same type safety, less boilerplate
```

## Common Inference Patterns

### Pattern 1: Inferred from Assignment

```typescript
const status = "pending";       // ✓ string
const count = 0;                // ✓ number
const isValid = true;           // ✓ boolean
```

### Pattern 2: Inferred from Function Call

```typescript
function getStatus(): "pending" | "shipped" | "delivered" {
  return "pending";
}

const status = getStatus();     // ✓ Inferred as "pending" | "shipped" | "delivered"
```

### Pattern 3: Inferred from Array Operations

```typescript
const numbers = [1, 2, 3];
const first = numbers[0];       // ✓ Inferred as number
```

### Pattern 4: Inferred from Object Property Access

```typescript
const user = { name: "Alice", age: 30 };
const name = user.name;         // ✓ Inferred as string
const age = user.age;           // ✓ Inferred as number
```

## Key Takeaways

- **Type inference is robust** - TypeScript infers types from values reliably
- **Use inference for clarity** - Don't over-annotate simple cases
- **Be explicit at boundaries** - Function parameters and public APIs need explicit types
- **Inference reduces boilerplate** - Let TypeScript do the work when it can
- **Function parameters are never inferred** - Always annotate them
- **Empty collections need annotation** - TypeScript can't guess the element type
- **Balance is key** - Mix inference and explicit annotations for clean, safe code

---

**Next: [Working Examples](./03-type-inference.test.ts)**
