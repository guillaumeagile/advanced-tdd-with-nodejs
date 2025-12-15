# Preamble

This chapter introduces TypeScript's **type system** and demonstrates how it can help you write **cohesive** code.

TypeScript is a **statically typed** language, which means that types are checked at compile-time, not runtime.
This is in contrast to **dynamically typed** languages like JavaScript, where types are checked at runtime.

TypeScript is a superset of JavaScript, so you can use all the same JavaScript features in your code.


TypeScript type system differs from JavaScript in two important ways:
- It uses **structural typing** instead of **dynamic typing**
- It uses **type annotations** instead of **dynamic duck typing**

TypeScript naming conventions:
- variables are **camelCase**
- functions and classes are **PascalCase**
- interfaces and enums are **PascalCase**
- types are **PascalCase**
- constants are **UPPER_CASE**

https://gist.github.com/anichitiandreea/e1d466022d772ea22db56399a7af576b#naming-conventions


# Chapter A: Cohesion - Types as Constraints

## What is a Type?

A **type** is a set of constraints that define:
- What values are valid
- What operations are allowed
- What properties/methods exist

```typescript
// A type defines valid values
type Age = number;  // Any number is valid (but should it be?)
type Email = string; // Any string is valid (but should it be?)

// Without constraints, types are too permissive
const age: Age = -5;        // ✗ Invalid but allowed
const email: Email = "not-an-email"; // ✗ Invalid but allowed
```

## The Type System

A **type system** is a set of rules that:
1. **Assign types** to expressions and values
2. **Check compatibility** between types
3. **Prevent invalid operations** at compile-time

TypeScript's type system is **structural** (shape-based) and **gradual** (allows `any`).

```typescript
// Structural typing - shape matters, not name
type Point = { x: number; y: number };
type Coordinate = { x: number; y: number };

const p: Point = { x: 1, y: 2 };
const c: Coordinate = p; // ✓ Same shape = compatible
```

## Type Errors vs. Syntax Errors

- **Syntax Error**: Invalid code structure (won't parse)
- **Type Error**: Valid syntax but semantically wrong (won't compile)

```typescript
const x = 5 +;  // ✗ Syntax error - incomplete expression

const y: string = 5; // ✗ Type error - number assigned to string
```

## Type Inference vs. Explicit Annotations

TypeScript can **infer** types from context:

```typescript
const name = "Alice";  // ✓ Inferred as string
const age = 30;        // ✓ Inferred as number
```

But **explicit annotations** are clearer and catch mistakes:

```typescript
const name: string = "Alice";  // ✓ Clear intent
const age: number = "30";      // ✗ Type error caught immediately
```

## Object Member Checking

TypeScript checks that you access valid properties:

```typescript
type User = {
  name: string;
  email: string;
};

const user: User = { name: "Alice", email: "alice@example.com" };
console.log(user.name);    // ✓ Valid property
console.log(user.phone);   // ✗ Type error - property doesn't exist
```

## Module Scoping

Types declared in a module are **local** unless exported:

```typescript
// file: user.ts
type UserId = string;  // Not exported - local to this file
export type User = { id: UserId; name: string };

// file: main.ts
import { User } from './user';
const u: User = { id: "123", name: "Alice" };
const id: UserId = "123"; // ✗ Error - UserId not exported
```

## Cohesion Through Types

**Cohesion** means related things are grouped together. Types create cohesion by:

1. **Grouping related data** - A `User` type groups `id`, `name`, `email`
2. **Enforcing constraints** - Only valid operations are allowed
3. **Revealing intent** - `Email` is clearer than `string`
4. **Preventing mixing** - Can't accidentally use `UserId` where `Email` is needed

```typescript
// Without types - low cohesion, high confusion
function createUser(a: string, b: string, c: string) {
  // Which parameter is what? Easy to mix up
  return { id: a, name: b, email: c };
}

// With types - high cohesion, clear intent
type UserId = string;
type Email = string;
type UserName = string;

function createUser(id: UserId, name: UserName, email: Email) {
  // Clear what each parameter means
  return { id, name, email };
}
```

## Key Takeaways

- **Types define constraints** on valid values and operations
- **Type systems enforce** these constraints at compile-time
- **Explicit annotations** are clearer than inference alone
- **Structural typing** checks shape compatibility
- **Types create cohesion** by grouping related data and enforcing constraints
- **Module scoping** controls type visibility

---

**Practice: [Working Examples](./01-basics.test.ts)**

## Next Chapters

| Chapter | Topics |
|---------|--------|
| **[02-classes-inheritance.md](./02-classes-inheritance.md)** | Classes as types • Inheritance hierarchies • <br/>Liskov Substitution Principle • Type narrowing & type guards •<br/> Abstract classes • Polymorphism •<br/> Structural vs nominal typing • Branded types |
| **[03-type-inference.md](./03-type-inference.md)** | Type inference mechanisms • When TypeScript infers automatically •<br/> When explicit annotations are required •<br/> Best practices for balancing inference and annotations |
