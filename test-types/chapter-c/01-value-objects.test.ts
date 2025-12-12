describe('Chapter C: Strong Typing & Clean Code', () => {
  describe('1. Primitive Obsession Anti-Pattern', () => {
    it('should show the problem with primitive types', () => {
      // ✗ Primitive Obsession
      function createUser(a: string, b: string, c: number) {
        return { id: a, name: b, age: c };
      }

      // Easy to mix up parameters
      // Types inferred from function return
      const user1 = createUser('Alice', 'alice@example.com', 30);
      const user2 = createUser('alice@example.com', 'Alice', 30); // ✗ Wrong order, no error!

      expect(user1.id).toBe('Alice');
      expect(user2.id).toBe('alice@example.com');
    });

    it('should use type aliases for clarity', () => {
      // ✓ Better - type aliases
      type UserId = string;
      type Email = string;
      type Age = number;

      function createUser(id: UserId, email: Email, age: Age) {
        return { id, email, age };
      }

      // Type inferred from function return
      const user = createUser('123', 'alice@example.com', 30);
      expect(user.email).toBe('alice@example.com');

      // Still allows invalid values (negative age, invalid email)
    });

    it('should use Value Objects for validation', () => {
      // ✓ Best - Value Objects with validation
      class Email {
        constructor(readonly value: string) {
          if (!value.includes('@')) {
            throw new Error('Invalid email format');
          }
        }

        equals(other: Email): boolean {
          return this.value.toLowerCase() === other.value.toLowerCase();
        }
      }

      class Age {
        constructor(readonly value: number) {
          if (value < 0 || value > 150) {
            throw new Error('Invalid age');
          }
        }
      }

      function createUser(id: string, email: Email, age: Age) {
        return { id, email, age };
      }

      const email = new Email('alice@example.com');
      const age = new Age(30);
      const user = createUser('123', email, age);

      expect(user.email.value).toBe('alice@example.com');
      expect(user.age.value).toBe(30);
     // user.age.value = 9;

      // Invalid values are caught immediately
      expect(() => new Email('invalid')).toThrow('Invalid email format');
      expect(() => new Age(-5)).toThrow('Invalid age');
    });
  });

  describe('2. Value Objects', () => {
    it('should create immutable Value Objects', () => {
      class Email {
        readonly value: string;

        constructor(value: string) {
          if (!value.includes('@')) {
            throw new Error('Invalid email');
          }
          this.value = value.toLowerCase();
        }
      }

      const email1 = new Email('Alice@Example.com');
      const email2 = new Email('alice@example.com');

      expect(email1.value).toBe('alice@example.com');
      expect(email2.value).toBe('alice@example.com');
    });

    it('should implement equals for Value Objects', () => {
      class Email {
        constructor(readonly value: string) {
          if (!value.includes('@')) throw new Error('Invalid email');
        }

        equals(other: Email): boolean {
          return this.value === other.value;
        }
      }

      const email1 = new Email('alice@example.com');
      const email2 = new Email('alice@example.com');
      const email3 = new Email('bob@example.com');

      expect(email1.equals(email2)).toBe(true);
      expect(email1.equals(email3)).toBe(false);
    });

    it('should implement toString for Value Objects', () => {
      class Money {
        constructor(readonly amount: number, readonly currency: string) {
          if (amount < 0) throw new Error('Amount cannot be negative');
        }

        toString(): string {
          return `${this.currency} ${this.amount.toFixed(2)}`;
        }
      }

      const money = new Money(99.99, 'USD');
      expect(money.toString()).toBe('USD 99.99');
    });

    it('should support operations on Value Objects', () => {
      class Money {
        constructor(readonly amount: number, readonly currency: string) {
          if (amount < 0) throw new Error('Amount cannot be negative');
        }

        add(other: Money): Money {
          if (this.currency !== other.currency) {
            throw new Error('Cannot add different currencies');
          }
          return new Money(this.amount + other.amount, this.currency);
        }

        multiply(factor: number): Money {
          return new Money(this.amount * factor, this.currency);
        }
      }

      const money1 = new Money(10, 'USD');
      const money2 = new Money(20, 'USD');

      const sum = money1.add(money2);
      expect(sum.amount).toBe(30);

      const doubled = money1.multiply(2);
      expect(doubled.amount).toBe(20);

      expect(() => money1.add(new Money(10, 'EUR'))).toThrow();
    });

    it('should validate constraints in Value Objects', () => {
      class Percentage {
        constructor(readonly value: number) {
          if (value < 0 || value > 100) {
            throw new Error('Percentage must be between 0 and 100');
          }
        }
      }

      const valid = new Percentage(50);
      expect(valid.value).toBe(50);

      expect(() => new Percentage(-10)).toThrow();
      expect(() => new Percentage(150)).toThrow();
    });
  });

  describe('3. Anemic Objects Anti-Pattern', () => {
    it('should show anemic objects - data only', () => {
      // ✗ Anemic Object
      class User {
        id: string;
        name: string;
        email: string;
        isActive: boolean;

        constructor(id: string, name: string, email: string) {
          this.id = id;
          this.name = name;
          this.email = email;
          this.isActive = true;
        }
      }

      // Business logic lives elsewhere
      function deactivateUser(user: User) {
        user.isActive = false;
      }

      const user = new User('1', 'Alice', 'alice@example.com');
      expect(user.isActive).toBe(true);

      deactivateUser(user);
      expect(user.isActive).toBe(false);
    });

    it('should create rich objects - data and behavior', () => {
      // ✓ Rich Object
      class User {
        private id: string;
        private name: string;
        private email: string;
        private isActive: boolean;

        constructor(id: string, name: string, email: string) {
          this.id = id;
          this.name = name;
          this.email = email;
          this.isActive = true;
        }

        deactivate() {
          this.isActive = false;
        }

        activate() {
          this.isActive = true;
        }

        isDeactivated(): boolean {
          return !this.isActive;
        }

        getId(): string {
          return this.id;
        }

        getName(): string {
          return this.name;
        }

        getEmail(): string {
          return this.email;
        }
      }

      const user = new User('1', 'Alice', 'alice@example.com');
      expect(user.isDeactivated()).toBe(false);

      user.deactivate();
      expect(user.isDeactivated()).toBe(true);

      user.activate();
      expect(user.isDeactivated()).toBe(false);
    });
  });

  describe('4. Single Responsibility Principle', () => {
    it('should violate SRP - multiple reasons to change', () => {
      // ✗ Violates SRP
      class User {
        name: string;
        email: string;

        constructor(name: string, email: string) {
          this.name = name;
          this.email = email;
        }

        // Reason 1: User data changes
        updateEmail(email: string) {
          this.email = email;
        }

        // Reason 2: Email sending logic changes
        sendWelcomeEmail() {
          // Send email via SMTP
          console.log(`Sending welcome email to ${this.email}`);
        }

        // Reason 3: Database logic changes
        save() {
          // Save to database
          console.log(`Saving user ${this.name}`);
        }
      }

      const user = new User('Alice', 'alice@example.com');
      expect(user.name).toBe('Alice');
    });

    it('should follow SRP - one reason to change', () => {
      // ✓ Follows SRP
      class User {
        constructor(readonly name: string, readonly email: string) {}
      }

      class EmailService {
        sendWelcomeEmail(user: User) {
          console.log(`Sending welcome email to ${user.email}`);
        }
      }

      class UserRepository {
        save(user: User) {
          console.log(`Saving user ${user.name}`);
        }
      }

      const user = new User('Alice', 'alice@example.com');
      const emailService = new EmailService();
      const repository = new UserRepository();

      emailService.sendWelcomeEmail(user);
      repository.save(user);

      expect(user.name).toBe('Alice');
    });
  });

  describe('5. Domain-Driven Design Through Types', () => {
    it('should use generic types - unclear intent', () => {
      // ✗ Generic types
      function processOrder(id: string, items: any[], total: number) {
        return { id, items, total };
      }

      const order = processOrder('123', [], 99.99);
      expect(order.id).toBe('123');
    });

    it('should use domain types - clear intent', () => {
      // ✓ Domain types
      type OrderId = string;
      type ProductId = string;

      type OrderItem = {
        productId: ProductId;
        quantity: number;
        price: number;
      };

      function processOrder(id: OrderId, items: OrderItem[], total: number) {
        return { id, items, total };
      }

      const order = processOrder('123', [], 99.99);
      expect(order.id).toBe('123');
    });

    it('should use domain classes - best intent', () => {
      // ✓ Domain classes
      class OrderId {
        constructor(readonly value: string) {
          if (!value) throw new Error('OrderId cannot be empty');
        }
      }

      class OrderItem {
        constructor(
          readonly productId: string,
          readonly quantity: number,
          readonly price: number
        ) {
          if (quantity <= 0) throw new Error('Quantity must be positive');
          if (price < 0) throw new Error('Price cannot be negative');
        }
      }

      class Order {
        constructor(
          readonly id: OrderId,
          readonly items: OrderItem[],
          readonly total: number
        ) {}

        addItem(item: OrderItem) {
          this.items.push(item);
        }

        getTotal(): number {
          return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
      }

      const orderId = new OrderId('123');
      const item = new OrderItem('PROD-1', 2, 50);
      const order = new Order(orderId, [item], 100);

      expect(order.id.value).toBe('123');
      expect(order.getTotal()).toBe(100);
    });
  });

  describe('6. Fine-Grained vs. Broad Types', () => {
    it('should avoid broad types - easy to mix up', () => {
      // ✗ Broad types
      function createUser(id: string, name: string, email: string) {
        return { id, name, email };
      }

      // Easy to mix up parameters
      const user1 = createUser('123', 'Alice', 'alice@example.com');
      const user2 = createUser('alice@example.com', 'Alice', '123'); // ✗ Wrong order

      expect(user1.id).toBe('123');
      expect(user2.id).toBe('alice@example.com');
    });

    it('should use fine-grained types - impossible to mix up', () => {
      // ✓ Fine-grained types using branded types
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      function createUserId(value: string): UserId {
        return value as UserId;
      }

      function createEmail(value: string): Email {
        if (!value.includes('@')) throw new Error('Invalid email');
        return value as Email;
      }

      function createUser(id: UserId, email: Email) {
        return { id, email };
      }

      const user = createUser(
        createUserId('123'),
        createEmail('alice@example.com')
      );

      expect(user.id).toBe('123');
      expect(user.email).toBe('alice@example.com');
    });

    it('should use classes for fine-grained types', () => {
      // ✓ Best - classes with validation
      class UserId {
        constructor(readonly value: string) {
          if (!value) throw new Error('UserId cannot be empty');
        }
      }

      class Email {
        constructor(readonly value: string) {
          if (!value.includes('@')) throw new Error('Invalid email');
        }
      }

      function createUser(id: UserId, email: Email) {
        return { id, email };
      }

      const user = createUser(
        new UserId('123'),
        new Email('alice@example.com')
      );

      expect(user.id.value).toBe('123');
      expect(user.email.value).toBe('alice@example.com');
    });
  });

  describe('7. Restrictive Types', () => {
    it('should use restrictive types to prevent invalid states', () => {
      type UserStatus = 'active' | 'inactive' | 'suspended';

      class User {
        constructor(
          readonly name: string,
          readonly status: UserStatus
        ) {}
      }

      const activeUser = new User('Alice', 'active');
      expect(activeUser.status).toBe('active');

      // This would be a type error:
      // const invalidUser = new User('Bob', 'deleted'); // ✗ Type error
    });

    it('should use enums for restrictive types', () => {
      enum UserStatus {
        Active = 'active',
        Inactive = 'inactive',
        Suspended = 'suspended'
      }

      class User {
        constructor(
          readonly name: string,
          readonly status: UserStatus
        ) {}
      }

      const user = new User('Alice', UserStatus.Active);
      expect(user.status).toBe('active');
    });

    it('should validate all constraints in constructors', () => {
      class User {
        constructor(
          readonly name: string,
          readonly age: number,
          readonly email: string
        ) {
          if (name.length < 2) throw new Error('Name too short');
          if (age < 0 || age > 150) throw new Error('Invalid age');
          if (!email.includes('@')) throw new Error('Invalid email');
        }
      }

      const user = new User('Alice', 30, 'alice@example.com');
      expect(user.name).toBe('Alice');

      expect(() => new User('A', 30, 'alice@example.com')).toThrow('Name too short');
      expect(() => new User('Alice', -5, 'alice@example.com')).toThrow('Invalid age');
      expect(() => new User('Alice', 30, 'invalid')).toThrow('Invalid email');
    });
  });

  describe('8. Checkpoint 🫵', () => {
    it('C.1: Explain why Value Objects are better than primitives', () => {
      // Write your answer:
      // Value Objects:
      // 1. Encapsulate validation - invalid states are impossible
      // 2. Provide semantic meaning - Email is clearer than string
      // 3. Support domain operations - Money can add, multiply, etc.
      // 4. Are immutable - prevent accidental changes
      // 5. Implement equals - can compare by value, not reference

      expect(true).toBe(true);
    });

    it('C.2: Design a PhoneNumber Value Object', () => {
      // Write your implementation:
      class PhoneNumber {
        constructor(readonly value: string) {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length < 10) {
            throw new Error('Phone number must have at least 10 digits');
          }
        }

        equals(other: PhoneNumber): boolean {
          return this.value === other.value;
        }

        toString(): string {
          return this.value;
        }
      }

      const phone = new PhoneNumber('555-123-4567');
      expect(phone.value).toBe('555-123-4567');

      expect(() => new PhoneNumber('123')).toThrow();
    });

    it('C.3: Identify anemic vs. rich objects', () => {
      // Anemic: Only data, no behavior
      class AnemicProduct {
        id: string;
        name: string;
        price: number;
        quantity: number;

        constructor(id: string, name: string, price: number, quantity: number) {
          this.id = id;
          this.name = name;
          this.price = price;
          this.quantity = quantity;
        }
      }

      // Rich: Data and behavior
      class RichProduct {
        constructor(
          readonly id: string,
          readonly name: string,
          readonly price: number,
          private quantity: number
        ) {}

        getQuantity(): number {
          return this.quantity;
        }

        decreaseQuantity(amount: number) {
          if (amount > this.quantity) {
            throw new Error('Not enough quantity');
          }
          this.quantity -= amount;
        }

        isInStock(): boolean {
          return this.quantity > 0;
        }
      }

      expect(true).toBe(true);
    });

    it('C.4: Apply SRP to a class with multiple responsibilities', () => {
      // Before: Multiple responsibilities
      // class Order {
      //   save() { }
      //   sendConfirmationEmail() { }
      //   calculateTax() { }
      // }

      // After: Single responsibility each
      class Order {
        constructor(readonly id: string, readonly total: number) {}
      }

      class OrderRepository {
        save(order: Order) {
          // Save to database
        }
      }

      class OrderEmailService {
        sendConfirmationEmail(order: Order) {
          // Send email
        }
      }

      class TaxCalculator {
        calculateTax(order: Order): number {
          return order.total * 0.1;
        }
      }

      expect(true).toBe(true);
    });
  });
});
