import { describe, it, expect } from 'vitest';

/**
 * CHAPTER B - Part 00: Internal State Coupling
 * 
 * This test file demonstrates:
 * 1. How functions become coupled to internal state
 * 2. Temporal coupling through state dependencies
 * 3. How to reduce coupling through pure functions and immutability
 */

// ============================================================================
// PART 1: STATE COUPLING IN CLASSES
// ============================================================================

describe('Part 1: State Coupling in Classes', () => {
  /**
   * ❌ TIGHTLY COUPLED: increment() is coupled to the 'count' field
   * 
   * Problems:
   * - increment() can't work without the count field
   * - If we rename 'count' to 'value', increment() breaks
   * - increment() has side effects (modifies state)
   * - Hard to test - must create instance and check state
   */
  class TightlyCouple_Counter {
    private count = 0;

    increment() {
      this.count++;  // ← Tightly coupled to 'count' field
    }

    getCount(): number {
      return this.count;
    }
  }

  it('tightly coupled counter works but is hard to test', () => {
    const counter = new TightlyCouple_Counter();
    counter.increment();
    counter.increment();
    
    expect(counter.getCount()).toBe(2);
    
    // Problem: We can only test the final state
    // We can't test what increment() returns
    // We can't test increment() in isolation
  });

  /**
   * ✅ LOOSELY COUPLED: Pure function approach
   * 
   * Benefits:
   * - increment() is independent of any state
   * - increment() can be called in any order
   * - increment() is easy to test
   * - No side effects
   */
  function increment(count: number): number {
    return count + 1;  // ← Pure function, no coupling
  }

  it('pure function is easy to test', () => {
    expect(increment(0)).toBe(1);
    expect(increment(5)).toBe(6);
    expect(increment(-1)).toBe(0);
    
    // Benefits:
    // - No setup needed
    // - No state to manage
    // - Can test all cases easily
    // - Same input always gives same output
  });

  /**
   * ✅ LOOSELY COUPLED: Immutable class approach
   * 
   * Benefits:
   * - increment() returns a new instance
   * - No state mutation
   * - Each instance is independent
   * - Easy to test
   */
  class Immutable_Counter {
    constructor(private count: number) {}

    increment(): Immutable_Counter {
      return new Immutable_Counter(this.count + 1);  // ← Returns new instance
    }

    getCount(): number {
      return this.count;
    }
  }

  it('immutable counter is composable and testable', () => {
    const counter0 = new Immutable_Counter(0);
    const counter1 = counter0.increment();
    const counter2 = counter1.increment();
    
    // Each instance is independent
    expect(counter0.getCount()).toBe(0);
    expect(counter1.getCount()).toBe(1);
    expect(counter2.getCount()).toBe(2);
    
    // Can chain operations
    const result = new Immutable_Counter(0)
      .increment()
      .increment()
      .increment();
    
    expect(result.getCount()).toBe(3);
  });
});

// ============================================================================
// PART 2: TEMPORAL COUPLING
// ============================================================================

describe('Part 2: Temporal Coupling - Order Matters', () => {
  /**
   * ❌ TEMPORAL COUPLING: Methods must be called in specific order
   * 
   * Problems:
   * - verify() must be called AFTER setUser()
   * - getUser() must be called AFTER verify()
   * - If you call them in wrong order, it fails
   * - Easy to use incorrectly
   */
  class TemporalCoupling_Account {
    private user: { id: string; name: string } | null = null;
    private isVerified = false;

    setUser(user: { id: string; name: string }) {
      this.user = user;
    }

    verify() {
      if (!this.user) {
        throw new Error('User not set! Call setUser() first');  // ✗ Temporal coupling
      }
      this.isVerified = true;
    }

    getUser(): { id: string; name: string } | null {
      if (!this.isVerified) {
        throw new Error('User not verified! Call verify() first');  // ✗ Temporal coupling
      }
      return this.user;
    }
  }

  it('temporal coupling - correct order works', () => {
    const account = new TemporalCoupling_Account();
    account.setUser({ id: '1', name: 'Alice' });
    account.verify();
    const user = account.getUser();
    
    expect(user.name).toBe('Alice');
  });

  it('temporal coupling - wrong order fails', () => {
    const account = new TemporalCoupling_Account();
    
    // Calling verify() before setUser() fails
    expect(() => account.verify()).toThrow('User not set!');
  });

  it('temporal coupling - calling getUser() before verify() fails', () => {
    const account = new TemporalCoupling_Account();
    account.setUser({ id: '1', name: 'Alice' });
    
    // Calling getUser() before verify() fails
    expect(() => account.getUser()).toThrow('User not verified!');
  });

  /**
   * ✅ NO TEMPORAL COUPLING: All data provided upfront
   * 
   * Benefits:
   * - No required order
   * - Can't be used incorrectly
   * - All dependencies explicit
   * - Easy to test
   */
  class NoCoupling_Account {
    constructor(
      private user: { id: string; name: string },
      private isVerified: boolean
    ) {}

    getUser(): { id: string; name: string } {
      if (!this.isVerified) {
        throw new Error('User not verified');
      }
      return this.user;
    }

    static create(user: { id: string; name: string }): NoCoupling_Account {
      return new NoCoupling_Account(user, false);
    }

    static createVerified(user: { id: string; name: string }): NoCoupling_Account {
      return new NoCoupling_Account(user, true);
    }
  }

  it('no temporal coupling - state is explicit', () => {
    // Can't create invalid state
    const account = NoCoupling_Account.createVerified({ id: '1', name: 'Alice' });
    const user = account.getUser();
    
    expect(user.name).toBe('Alice');
  });

  it('no temporal coupling - unverified account fails immediately', () => {
    const account = NoCoupling_Account.create({ id: '1', name: 'Alice' });
    
    // Fails immediately - no hidden state
    expect(() => account.getUser()).toThrow('User not verified');
  });
});

// ============================================================================
// PART 3: SCOPE COUPLING - GLOBAL STATE
// ============================================================================

describe('Part 3: Scope Coupling - Global State', () => {
  /**
   * ❌ SCOPE COUPLING: Functions depend on global variable
   * 
   * Problems:
   * - Both functions depend on globalCounter
   * - Hard to test - must manage global state
   * - Can't run tests in parallel (shared state)
   * - Impossible to reuse functions independently
   */
  let globalCounter = 0;

  function incrementGlobal() {
    globalCounter++;  // ← Coupled to global variable
  }

  function getGlobalCounter(): number {
    return globalCounter;  // ← Coupled to global variable
  }

  it('global state coupling - works but is fragile', () => {
    // Reset global state (fragile!)
    globalCounter = 0;
    
    incrementGlobal();
    incrementGlobal();
    
    expect(getGlobalCounter()).toBe(2);
    
    // Problem: If another test modifies globalCounter, this test fails
    // Problem: Can't run tests in parallel
  });

  /**
   * ✅ NO SCOPE COUPLING: Pass state as parameter
   * 
   * Benefits:
   * - Functions are independent
   * - No global state to manage
   * - Can run tests in parallel
   * - Easy to reuse
   */
  function increment_Pure(count: number): number {
    return count + 1;  // ← No coupling
  }

  function getCounter_Pure(count: number): number {
    return count;  // ← No coupling
  }

  it('no scope coupling - pure functions are independent', () => {
    const count1 = increment_Pure(0);
    const count2 = increment_Pure(count1);
    
    expect(getCounter_Pure(count2)).toBe(2);
    
    // Benefits:
    // - No setup needed
    // - No global state
    // - Can run in parallel
    // - Easy to reuse
  });
});

// ============================================================================
// PART 4: PRACTICAL EXAMPLE - BUILDING A BETTER COUNTER
// ============================================================================

describe('Part 4: Practical Example - Building a Better Counter', () => {
  /**
   * ❌ TIGHTLY COUPLED: Multiple internal dependencies
   * 
   * Problems:
   * - increment() and decrement() both depend on history
   * - Can't change how history is stored without breaking both
   * - Hard to test - must verify both count and history
   * - Temporal coupling - history must be maintained
   */
  class BadCounter {
    private count = 0;
    private history: number[] = [];

    increment() {
      this.count++;
      this.history.push(this.count);  // ← Coupled to history field
    }

    decrement() {
      this.count--;
      this.history.push(this.count);  // ← Coupled to history field
    }

    getCount(): number {
      return this.count;  // ← Coupled to count field
    }

    getHistory(): number[] {
      return this.history;  // ← Coupled to history field
    }
  }

  it('bad counter - tightly coupled', () => {
    const counter = new BadCounter();
    counter.increment();
    counter.increment();
    counter.decrement();
    
    expect(counter.getCount()).toBe(1);
    expect(counter.getHistory()).toEqual([1, 2, 1]);
    
    // Problems:
    // - Must test both count and history together
    // - Can't test increment() without affecting history
    // - Hard to understand dependencies
  });

  /**
   * ✅ LOOSELY COUPLED: Pure functions + Immutability
   * 
   * Benefits:
   * - Each method is independent
   * - No shared mutable state
   * - Easy to test - just check return values
   * - No temporal coupling
   * - Can chain operations safely
   */
  class BetterCounter {
    constructor(
      private count: number,
      private history: readonly number[] = []
    ) {}

    increment(): BetterCounter {
      const newCount = this.count + 1;
      return new BetterCounter(newCount, [...this.history, newCount]);
    }

    decrement(): BetterCounter {
      const newCount = this.count - 1;
      return new BetterCounter(newCount, [...this.history, newCount]);
    }

    getCount(): number {
      return this.count;
    }

    getHistory(): readonly number[] {
      return this.history;
    }
  }

  it('better counter - loosely coupled and composable', () => {
    const result = new BetterCounter(0)
      .increment()
      .increment()
      .decrement();
    
    expect(result.getCount()).toBe(1);
    expect(result.getHistory()).toEqual([1, 2, 1]);
  });

  it('better counter - each operation is independent', () => {
    const counter0 = new BetterCounter(0);
    const counter1 = counter0.increment();
    const counter2 = counter1.increment();
    const counter3 = counter2.decrement();
    
    // Each instance is independent
    expect(counter0.getCount()).toBe(0);
    expect(counter1.getCount()).toBe(1);
    expect(counter2.getCount()).toBe(2);
    expect(counter3.getCount()).toBe(1);
    
    // History is preserved separately
    expect(counter0.getHistory()).toEqual([]);
    expect(counter1.getHistory()).toEqual([1]);
    expect(counter2.getHistory()).toEqual([1, 2]);
    expect(counter3.getHistory()).toEqual([1, 2, 1]);
  });

  it('better counter - no temporal coupling', () => {
    // Can call operations in any order
    const counter1 = new BetterCounter(5).decrement();
    const counter2 = new BetterCounter(0).increment().increment();
    
    expect(counter1.getCount()).toBe(4);
    expect(counter2.getCount()).toBe(2);
    
    // No errors, no hidden state
  });
});

// ============================================================================
// PART 5: EXPLICIT DEPENDENCIES - DEPENDENCY INJECTION
// ============================================================================

describe('Part 5: Explicit Dependencies - Dependency Injection', () => {
  interface Database {
    insert(table: string, data: any): any;
  }

  /**
   * ❌ HIDDEN DEPENDENCY: Database is created internally
   * 
   * Problems:
   * - createUser() depends on a specific Database implementation
   * - Can't test with a mock database
   * - Hard to understand what createUser() needs
   */
  class HiddenDependency_UserService {
    private db = new (class implements Database {
      insert(table: string, data: any) {
        return { id: '1', ...data };
      }
    })();

    createUser(name: string) {
      return this.db.insert('users', { name });
    }
  }

  it('hidden dependency - works but hard to test', () => {
    const service = new HiddenDependency_UserService();
    const user = service.createUser('Alice');
    
    expect(user.name).toBe('Alice');
    
    // Problem: Can't inject a mock database for testing
  });

  /**
   * ✅ EXPLICIT DEPENDENCY: Database is injected
   * 
   * Benefits:
   * - Dependencies are visible
   * - Easy to test - inject mock database
   * - Easy to understand what the method needs
   * - Not coupled to specific Database implementation
   */
  class ExplicitDependency_UserService {
    constructor(private db: Database) {}

    createUser(name: string) {
      return this.db.insert('users', { name });
    }
  }

  it('explicit dependency - easy to test with mock', () => {
    // Create a mock database
    const mockDb: Database = {
      insert: (table: string, data: any) => {
        return { id: 'mock-1', ...data };
      }
    };

    const service = new ExplicitDependency_UserService(mockDb);
    const user = service.createUser('Alice');
    
    expect(user.name).toBe('Alice');
    expect(user.id).toBe('mock-1');
    
    // Benefits:
    // - No setup needed
    // - Can control the database behavior
    // - Easy to test different scenarios
  });

  it('explicit dependency - can inject different implementations', () => {
    // Mock 1: Returns specific ID
    const mockDb1: Database = {
      insert: () => ({ id: 'user-1', name: 'Alice' })
    };

    // Mock 2: Returns different ID
    const mockDb2: Database = {
      insert: () => ({ id: 'user-2', name: 'Bob' })
    };

    const service1 = new ExplicitDependency_UserService(mockDb1);
    const service2 = new ExplicitDependency_UserService(mockDb2);
    
    expect(service1.createUser('Alice').id).toBe('user-1');
    expect(service2.createUser('Bob').id).toBe('user-2');
  });
});

// ============================================================================
// PART 6: SUMMARY - KEY PRINCIPLES
// ============================================================================

describe('Part 6: Summary - Key Principles', () => {
  it('principle 1: minimize internal state', () => {
    // Less state = less coupling
    
    // ❌ Multiple internal states
    class ManyStates {
      private state1 = 0;
      private state2 = '';
      private state3: any[] = [];
      
      method1() { this.state1++; }
      method2() { this.state2 += 'x'; }
      method3() { this.state3.push(this.state1); }
    }
    
    // ✅ Minimal state
    class FewStates {
      constructor(private value: number) {}
      
      increment(): FewStates {
        return new FewStates(this.value + 1);
      }
      
      getValue(): number {
        return this.value;
      }
    }
    
    expect(new FewStates(0).increment().getValue()).toBe(1);
  });

  it('principle 2: use pure functions', () => {
    // Functions without side effects are easier to test and compose
    
    // ❌ Side effects
    let counter = 0;
    function impure() {
      counter++;  // ← Side effect
      return counter;
    }
    
    // ✅ Pure function
    function pure(count: number): number {
      return count + 1;  // ← No side effects
    }
    
    expect(pure(0)).toBe(1);
    expect(pure(0)).toBe(1);  // Same input, same output
  });

  it('principle 3: prefer immutability', () => {
    // Immutable objects can't have temporal coupling
    
    class Immutable {
      constructor(private value: number) {}
      
      add(n: number): Immutable {
        return new Immutable(this.value + n);
      }
      
      getValue(): number {
        return this.value;
      }
    }
    
    const a = new Immutable(0);
    const b = a.add(5);
    const c = b.add(3);
    
    // Each instance is independent
    expect(a.getValue()).toBe(0);
    expect(b.getValue()).toBe(5);
    expect(c.getValue()).toBe(8);
  });

  it('principle 4: make dependencies explicit', () => {
    // Pass state as parameters, not hidden in fields
    
    // ❌ Hidden dependency
    let globalState = 0;
    function hidden() {
      return globalState;
    }
    
    // ✅ Explicit dependency
    function explicit(state: number): number {
      return state;
    }
    
    expect(explicit(42)).toBe(42);
  });

  it('principle 5: reduce surface of dependencies', () => {
    // Fewer things depending on each other = less coupling
    
    // ❌ Many dependencies
    class TightlyCoupled {
      private a = 0;
      private b = 0;
      private c = 0;
      
      method1() { this.a++; this.b++; this.c++; }
      method2() { this.a--; this.b--; this.c--; }
    }
    
    // ✅ Few dependencies
    function looselyDecoupled(value: number): number {
      return value + 1;
    }
    
    expect(looselyDecoupled(5)).toBe(6);
  });
});
