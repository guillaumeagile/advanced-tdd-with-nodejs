// Domain Model: E-Commerce System
// Entities: Product, Order, OrderItem
// Relationships: Order contains OrderItems, OrderItem references Product

describe('Chapter A Section 02: Classes and Inheritance as Types', () => {
  describe('1. Classes as Types', () => {
    it('should understand that classes define types', () => {
      class Product {
        constructor(readonly id: string, readonly name: string, readonly price: number) {}

        getDisplayName(): string {
          return `${this.name} ($${this.price})`;
        }
      }

      const product: Product = new Product('PROD-1', 'Laptop', 999.99);

      expect(product.id).toBe('PROD-1');
      expect(product.getDisplayName()).toBe('Laptop ($999.99)');
    });

    it('should enforce that instances have correct shape', () => {
      class Product {
        constructor(readonly id: string, readonly name: string, readonly price: number) {}
      }

      const product: Product = new Product('PROD-1', 'Laptop', 999.99);

      expect(product.id).toBe('PROD-1');
      expect(product.name).toBe('Laptop');
      expect(product.price).toBe(999.99);

      // This would be a type error:
      // const invalid: Product = { id: 'PROD-1', name: 'Laptop', price: 999.99 }; // ✗ Not a Product instance
    });

    it('should distinguish between class instances and objects', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      const product: Product = new Product('PROD-1', 'Laptop');
      const obj = { id: 'PROD-2', name: 'Mouse' };

      expect(product instanceof Product).toBe(true);
      expect(obj instanceof Product).toBe(false);
    });

    it('should use classes to group related data and behavior', () => {
      class Order {
        private items: { productId: string; quantity: number }[] = [];

        constructor(readonly orderId: string) {}

        addItem(productId: string, quantity: number): void {
          if (quantity > 0) {
            this.items.push({ productId, quantity });
          }
        }

        removeItem(productId: string): boolean {
          const index = this.items.findIndex(item => item.productId === productId);
          if (index >= 0) {
            this.items.splice(index, 1);
            return true;
          }
          return false;
        }

        getItemCount(): number {
          return this.items.reduce((sum, item) => sum + item.quantity, 0);
        }
      }

      const order = new Order('ORD-001');
      expect(order.getItemCount()).toBe(0);

      order.addItem('PROD-1', 2);
      expect(order.getItemCount()).toBe(2);

      order.addItem('PROD-2', 1);
      expect(order.getItemCount()).toBe(3);

      const removed = order.removeItem('PROD-1');
      expect(removed).toBe(true);
      expect(order.getItemCount()).toBe(1);
    });
  });

  describe('2. Inheritance and Type Hierarchies', () => {
    it('should create type hierarchies with inheritance', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string {
          return 'Order is pending';
        }
      }

      const status: PendingStatus = new PendingStatus('Pending');
      expect(status.getDescription()).toBe('Order is pending');
      expect(status.name).toBe('Pending');
    });

    it('should allow subtype assignment to parent type', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Pending'; }
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string { return 'Shipped'; }
        getTrackingNumber(): string { return 'TRACK-123'; }
      }

      const shipped: ShippedStatus = new ShippedStatus('Shipped');
      const status: OrderStatus = shipped; // ✓ ShippedStatus is assignable to OrderStatus

      expect(status.name).toBe('Shipped');
      expect(status.getDescription()).toBe('Shipped');
    });

    it('should not allow parent type assignment to subtype', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Pending'; }
      }

      const status: OrderStatus = new PendingStatus('Pending');
      // const pending: PendingStatus = status; // ✗ Type error - OrderStatus is not assignable to PendingStatus
    });

    it('should support multiple levels of inheritance', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      abstract class ShippableStatus extends OrderStatus {
        abstract getShippingInfo(): string;
      }

      class ShippedStatus extends ShippableStatus {
        getDescription(): string { return 'Shipped'; }
        getShippingInfo(): string { return 'In transit'; }
      }

      const shipped: ShippedStatus = new ShippedStatus('Shipped');
      expect(shipped.getDescription()).toBe('Shipped');
      expect(shipped.getShippingInfo()).toBe('In transit');
      expect(shipped.name).toBe('Shipped');
    });

    it('should override parent methods in subclasses', () => {
      abstract class OrderStatus {
        getDescription(): string { return 'Unknown'; }
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Awaiting payment'; }
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string { return 'On the way'; }
      }

      const pending: OrderStatus = new PendingStatus();
      const shipped: OrderStatus = new ShippedStatus();

      expect(pending.getDescription()).toBe('Awaiting payment');
      expect(shipped.getDescription()).toBe('On the way');
    });

    it('should call parent methods with super', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}

        describe(): string {
          return `Status: ${this.name}`;
        }
      }

      class ShippedStatus extends OrderStatus {
        describe(): string {
          return super.describe() + ' (In Transit)';
        }
      }

      const status = new ShippedStatus('Shipped');
      expect(status.describe()).toBe('Status: Shipped (In Transit)');
    });
  });

  describe('3. Liskov Substitution Principle', () => {
    it('should allow subtypes to be used where parent types are expected', () => {
      abstract class OrderProcessor {
        abstract process(orderId: string): boolean;
      }

      class StandardOrderProcessor extends OrderProcessor {
        process(orderId: string): boolean {
          return orderId.length > 0;
        }
      }

      class PremiumOrderProcessor extends OrderProcessor {
        process(orderId: string): boolean {
          return orderId.length > 0 && !orderId.startsWith('INVALID');
        }
      }

      function processOrder(processor: OrderProcessor, orderId: string) {
        return processor.process(orderId);
      }

      expect(processOrder(new StandardOrderProcessor(), 'ORD-001')).toBe(true);
      expect(processOrder(new PremiumOrderProcessor(), 'ORD-002')).toBe(true);
      expect(processOrder(new PremiumOrderProcessor(), 'INVALID-001')).toBe(false);
    });

    it('should ensure subtypes fulfill parent contracts', () => {
      abstract class PaymentProcessor {
        abstract process(amount: number): boolean;
      }

      class CreditCardProcessor extends PaymentProcessor {
        process(amount: number): boolean {
          return amount > 0 && amount < 10000;
        }
      }

      const processor: PaymentProcessor = new CreditCardProcessor();

      expect(processor.process(100)).toBe(true);
      expect(processor.process(0)).toBe(false);
    });
  });

  describe('4. Type Narrowing with instanceof', () => {
    it('should narrow types with instanceof', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class PendingStatus extends OrderStatus {}
      class ShippedStatus extends OrderStatus {
        getTrackingNumber(): string { return 'TRACK-123'; }
      }
      class DeliveredStatus extends OrderStatus {}

      function handleStatus(status: OrderStatus): string {
        if (status instanceof ShippedStatus) {
          return `${status.name}: ${status.getTrackingNumber()}`;
        } else if (status instanceof DeliveredStatus) {
          return `${status.name}: Delivered`;
        }
        return `${status.name}: Pending`;
      }

      expect(handleStatus(new ShippedStatus('Shipped'))).toBe('Shipped: TRACK-123');
      expect(handleStatus(new DeliveredStatus('Delivered'))).toBe('Delivered: Delivered');
      expect(handleStatus(new PendingStatus('Pending'))).toBe('Pending: Pending');
    });

    it('should use property checks to narrow types', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class ShippedStatus extends OrderStatus {
        getTrackingNumber(): string { return 'TRACK-123'; }
      }

      function getInfo(status: OrderStatus): string {
        if ('getTrackingNumber' in status) {
          return 'Has tracking';
        }
        return 'No tracking';
      }

      expect(getInfo(new ShippedStatus('Shipped'))).toBe('Has tracking');
    });

    it('should narrow types in conditional branches', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class AdminStatus extends OrderStatus {
        readonly role = 'admin';
        cancelOrder(id: string): void { /* cancel */ }
      }

      function handleOrderStatus(status: OrderStatus): string {
        if (status instanceof AdminStatus) {
          return `${status.name} (admin access)`;
        }
        return `${status.name} (standard)`;
      }

      expect(handleOrderStatus(new AdminStatus('Admin'))).toBe('Admin (admin access)');
    });
  });

  describe('5. Type Assertions (Casts)', () => {
    it('should use as to cast types', () => {
      const value: unknown = 'PROD-001';
      const productId: string = value as string;

      expect(productId).toBe('PROD-001');
    });

    it('should use casts when you know the type better than TypeScript', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      const data: unknown = new Product('PROD-1', 'Laptop');
      const product = data as Product;

      expect(product.name).toBe('Laptop');
    });

    it('should understand that casts are type-level only', () => {
      const price: number = 99.99;
      const priceStr: string = price as unknown as string;

      // At runtime, priceStr is still 99.99 (a number)
      expect(typeof priceStr).toBe('number');
      expect(priceStr).toBe(99.99);
    });

    it('should avoid casts when possible', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      // ✗ Dangerous cast - bypasses safety
      const data: unknown = { id: 'PROD-1', name: 'Laptop' }; // Not actually a Product
      // const product = data as Product; // Dangerous!

      // ✓ Better - use type guards
      function isProduct(value: unknown): value is Product {
        return value instanceof Product;
      }

      const actualProduct = new Product('PROD-1', 'Laptop');
      if (isProduct(actualProduct)) {
        expect(actualProduct.name).toBe('Laptop');
      }
    });

    it('should use casts with external data', () => {
      // Simulate API response
      const apiResponse: unknown = { id: 'ORD-001', total: 99.99 };
      const order = apiResponse as { id: string; total: number };

      expect(order.id).toBe('ORD-001');
    });
  });

  describe('6. Type Predicates', () => {
    it('should use type predicates to narrow types safely', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      function isProduct(value: unknown): value is Product {
        return value instanceof Product;
      }

      const product = new Product('PROD-1', 'Laptop');
      const notProduct = { id: 'PROD-2', name: 'Mouse' };

      expect(isProduct(product)).toBe(true);
      expect(isProduct(notProduct)).toBe(false);
    });

    it('should use type predicates in conditional logic', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      function isProduct(value: unknown): value is Product {
        return value instanceof Product;
      }

      function getProductName(value: unknown): string {
        if (isProduct(value)) {
          return value.name;
        }
        return 'Unknown';
      }

      expect(getProductName(new Product('PROD-1', 'Laptop'))).toBe('Laptop');
      expect(getProductName({ id: 'PROD-2', name: 'Mouse' })).toBe('Unknown');
    });

    it('should create custom type predicates', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
      }

      class ShippedStatus extends OrderStatus {
        trackingNumber: string = 'TRACK-123';
      }

      function isShipped(status: OrderStatus): status is ShippedStatus {
        return status instanceof ShippedStatus;
      }

      const shipped = new ShippedStatus('Shipped');

      if (isShipped(shipped)) {
        expect(shipped.trackingNumber).toBe('TRACK-123');
      }

      // const pending = new OrderStatus('Pending'); // ✗ Type error - can't instantiate abstract class

      // Instead, use a concrete subclass
      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Pending'; }
      }

      const pending = new PendingStatus('Pending');
      expect(isShipped(pending)).toBe(false);
    });

    it('should use type predicates with arrays', () => {
      class Product {
        constructor(readonly id: string, readonly name: string) {}
      }

      function isProduct(value: unknown): value is Product {
        return value instanceof Product;
      }

      const items: unknown[] = [
        new Product('PROD-1', 'Laptop'),
        { id: 'PROD-2', name: 'Mouse' },
        new Product('PROD-3', 'Keyboard')
      ];

      const products = items.filter(isProduct);

      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Laptop');
      expect(products[1].name).toBe('Keyboard');
    });
  });

  describe('7. Abstract Classes', () => {
    it('should define abstract classes with abstract methods', () => {
      abstract class OrderProcessor {
        constructor(readonly name: string) {}

        abstract process(orderId: string): boolean;

        describe(): string {
          return `${this.name} processor`;
        }
      }

      class StandardProcessor extends OrderProcessor {
        process(orderId: string): boolean {
          return orderId.length > 0;
        }
      }

      const processor: OrderProcessor = new StandardProcessor('Standard');

      expect(processor.process('ORD-001')).toBe(true);
      expect(processor.describe()).toBe('Standard processor');
    });

    it('should enforce that abstract methods are implemented', () => {
      abstract class OrderStatus {
        abstract getDescription(): string;
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string {
          return 'Order shipped';
        }
      }

      const status: OrderStatus = new ShippedStatus();
      expect(status.getDescription()).toBe('Order shipped');
    });

    it('should not allow instantiation of abstract classes', () => {
      abstract class OrderProcessor {
        abstract process(orderId: string): boolean;
      }

      // This would be a type error:
      // const processor = new OrderProcessor(); // ✗ Can't instantiate abstract class

      class StandardProcessor extends OrderProcessor {
        process(orderId: string): boolean {
          return orderId.length > 0;
        }
      }

      const processor: OrderProcessor = new StandardProcessor();
      expect(processor.process('ORD-001')).toBe(true);
    });

    it('should use abstract classes to define contracts', () => {
      abstract class Repository<T> {
        abstract save(item: T): void;
        abstract findById(id: string): T | null;

        count(): number {
          return 0;
        }
      }

      class ProductRepository extends Repository<{ id: string; name: string }> {
        private products: { id: string; name: string }[] = [];

        save(item: { id: string; name: string }): void {
          this.products.push(item);
        }

        findById(id: string): { id: string; name: string } | null {
          return this.products.find(p => p.id === id) || null;
        }
      }

      const repo: Repository<{ id: string; name: string }> = new ProductRepository();
      repo.save({ id: 'PROD-1', name: 'Laptop' });

      const product = repo.findById('PROD-1');
      expect(product?.name).toBe('Laptop');
    });
  });

  describe('8. Polymorphism', () => {
    it('should use polymorphism to write generic code', () => {
      abstract class OrderStatus {
        constructor(readonly name: string) {}
        abstract getDescription(): string;
      }

      class PendingStatus extends OrderStatus {
        getDescription(): string { return 'Awaiting payment'; }
      }

      class ShippedStatus extends OrderStatus {
        getDescription(): string { return 'In transit'; }
      }

      class DeliveredStatus extends OrderStatus {
        getDescription(): string { return 'Delivered'; }
      }

      function statusReport(statuses: OrderStatus[]): string[] {
        return statuses.map(status => `${status.name}: ${status.getDescription()}`);
      }

      const report = statusReport([
        new PendingStatus('Pending'),
        new ShippedStatus('Shipped'),
        new DeliveredStatus('Delivered')
      ]);

      expect(report).toEqual([
        'Pending: Awaiting payment',
        'Shipped: In transit',
        'Delivered: Delivered'
      ]);
    });

    it('should use polymorphism with different implementations', () => {
      abstract class PaymentProcessor {
        abstract process(amount: number): boolean;
        abstract getProviderName(): string;
      }

      class CreditCardProcessor extends PaymentProcessor {
        process(amount: number): boolean { return amount > 0 && amount < 10000; }
        getProviderName(): string { return 'Credit Card'; }
      }

      class PayPalProcessor extends PaymentProcessor {
        process(amount: number): boolean { return amount > 0; }
        getProviderName(): string { return 'PayPal'; }
      }

      function processOrderPayment(processor: PaymentProcessor, amount: number): string {
        if (processor.process(amount)) {
          return `Order payment processed via ${processor.getProviderName()}`;
        }
        return 'Payment failed';
      }

      expect(processOrderPayment(new CreditCardProcessor(), 100)).toBe('Order payment processed via Credit Card');
      expect(processOrderPayment(new PayPalProcessor(), 100)).toBe('Order payment processed via PayPal');
      expect(processOrderPayment(new CreditCardProcessor(), 20000)).toBe('Payment failed');
    });
  });

  describe('9. Classes vs. Interfaces', () => {
    it('should understand the difference between classes and interfaces', () => {
      interface OrderStatus {
        name: string;
        getDescription(): string;
      }

      class ShippedStatus implements OrderStatus {
        constructor(readonly name: string) {}
        getDescription(): string { return 'In transit'; }
      }

      const status1: OrderStatus = new ShippedStatus('Shipped');
      const status2: ShippedStatus = new ShippedStatus('Shipped');

      expect(status1.getDescription()).toBe('In transit');
      expect(status2.getDescription()).toBe('In transit');
    });

    it('should use interfaces for contracts without implementation', () => {
      interface OrderNotifier {
        notify(orderId: string): void;
      }

      class EmailNotifier implements OrderNotifier {
        notify(orderId: string): void {
          // Send email notification
        }
      }

      const notifier: OrderNotifier = new EmailNotifier();
      notifier.notify('ORD-001');

      expect(true).toBe(true);
    });

    it('should use classes when you need implementation and state', () => {
      class Order {
        private createdAt: Date;

        constructor(readonly orderId: string) {
          this.createdAt = new Date();
        }

        getDaysOld(): number {
          const now = new Date();
          return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      const order = new Order('ORD-001');
      expect(order.orderId).toBe('ORD-001');
      expect(order.getDaysOld()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('10. Duck Typing: Structural vs. Nominal', () => {
    it('should use structural typing - shape matters, not name', () => {
      interface Logger {
        log(message: string): void;
      }

      // This class doesn't explicitly implement Logger
      class ConsoleLogger {
        log(message: string) {
          // console.log(message);
        }
      }

      // But it's assignable to Logger because it has the same shape
      const logger: Logger = new ConsoleLogger();

      expect(logger).toBeDefined();
    });

    it('should allow any object with the right shape', () => {
      interface Reader {
        read(): string;
      }

      // Plain object works if it has the right shape
      const plainReader: Reader = {
        read: () => 'content'
      };

      expect(plainReader.read()).toBe('content');
    });

    it('should enable flexible composition with structural typing', () => {
      interface Drawable {
        draw(): void;
      }

      interface Erasable {
        erase(): void;
      }

      class Pencil {
        draw() { /* draw */ }
        erase() { /* erase */ }
      }

      // Pencil works as both Drawable and Erasable
      const drawable: Drawable = new Pencil();
      const erasable: Erasable = new Pencil();

      expect(drawable).toBeDefined();
      expect(erasable).toBeDefined();
    });

    it('should show the problem of accidental compatibility', () => {
      type UserId = string;
      type Email = string;

      const userId: UserId = 'user123';
      const email: Email = userId; // ✓ Works but semantically wrong!

      expect(email).toBe('user123');
    });

    it('should use branded types to prevent accidental mixing', () => {
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      function createUserId(value: string): UserId {
        return value as UserId;
      }

      function createEmail(value: string): Email {
        return value as Email;
      }

      const userId = createUserId('user123');
      const email = createEmail('alice@example.com');

      // This would be a type error:
      // const wrongEmail: Email = userId; // ✗ Type error

      expect(userId).toBe('user123');
      expect(email).toBe('alice@example.com');
    });

    it('should understand structural typing enables library interop', () => {
      // Library A defines Logger
      interface LoggerA {
        log(msg: string): void;
      }

      // Library B defines Logger (same shape, different name)
      interface LoggerB {
        log(msg: string): void;
      }

      class MyLogger {
        log(msg: string) { /* log */ }
      }

      // Works with both libraries without adaptation
      const loggerA: LoggerA = new MyLogger();
      const loggerB: LoggerB = new MyLogger();

      expect(loggerA).toBeDefined();
      expect(loggerB).toBeDefined();
    });

    it('should compare with nominal typing (conceptually)', () => {
      // In TypeScript (structural):
      interface Animal {
        name: string;
        makeSound(): string;
      }

      class Dog {
        constructor(readonly name: string) {}
        makeSound(): string { return 'Woof!'; }
      }

      // Works without explicit implements
      const animal: Animal = new Dog('Buddy');

      // In Java (nominal), this would NOT work:
      // class Dog { ... } // Doesn't explicitly implement Animal
      // Animal animal = new Dog(); // ✗ Type error

      expect(animal.makeSound()).toBe('Woof!');
    });

    it('should use explicit implements for clarity even with structural typing', () => {
      interface Logger {
        log(message: string): void;
      }

      // Explicitly implement for clarity, even though not required
      class ConsoleLogger implements Logger {
        log(message: string) {
          // console.log(message);
        }
      }

      const logger: Logger = new ConsoleLogger();

      expect(logger).toBeDefined();
    });
  });

  describe('11. Checkpoint 🫵', () => {
    it('A2.1: Explain why classes are types', () => {
      // Write your answer:
      // Classes are types because they:
      // 1. Define a set of valid values (instances)
      // 2. Define a set of valid operations (methods)
      // 3. Define a contract that instances must fulfill
      // 4. Can be used in type annotations
      // 5. Can be checked with instanceof

      expect(true).toBe(true);
    });

    it('A2.2: Design an inheritance hierarchy for vehicles', () => {
      // Write your implementation:
      abstract class Vehicle {
        constructor(readonly brand: string, readonly year: number) {}
        abstract getMaxSpeed(): number;
      }

      class Car extends Vehicle {
        getMaxSpeed(): number { return 200; }
      }

      class Truck extends Vehicle {
        getMaxSpeed(): number { return 150; }
      }

      class Motorcycle extends Vehicle {
        getMaxSpeed(): number { return 250; }
      }

      const vehicles: Vehicle[] = [
        new Car('Toyota', 2020),
        new Truck('Volvo', 2019),
        new Motorcycle('Harley', 2021)
      ];

      expect(vehicles).toHaveLength(3);
      expect(vehicles[0].getMaxSpeed()).toBe(200);
    });

    it('A2.3: Identify when to use casts vs. type guards', () => {
      // Casts (as):
      // - Use when you have information TypeScript doesn't
      // - Use with DOM elements
      // - Use rarely - they bypass type safety
      //
      // Type Guards (instanceof, type predicates):
      // - Use to narrow types safely
      // - Use in conditional logic
      // - Preferred over casts

      class User {
        constructor(readonly name: string) {}
      }

      function isUser(value: unknown): value is User {
        return value instanceof User;
      }

      const user = new User('Alice');
      if (isUser(user)) {
        expect(user.name).toBe('Alice');
      }
    });

    it('A2.4: Implement polymorphism with abstract classes', () => {
      // Write your implementation:
      abstract class Shape {
        abstract getArea(): number;
        abstract getPerimeter(): number;
      }

      class Circle extends Shape {
        constructor(readonly radius: number) { super(); }
        getArea(): number { return Math.PI * this.radius * this.radius; }
        getPerimeter(): number { return 2 * Math.PI * this.radius; }
      }

      class Square extends Shape {
        constructor(readonly side: number) { super(); }
        getArea(): number { return this.side * this.side; }
        getPerimeter(): number { return 4 * this.side; }
      }

      function describeShape(shape: Shape): string {
        return `Area: ${shape.getArea().toFixed(2)}, Perimeter: ${shape.getPerimeter().toFixed(2)}`;
      }

      const circle = new Circle(5);
      const square = new Square(4);

      expect(describeShape(circle)).toContain('78.54');
      expect(describeShape(square)).toContain('16.00');
    });

    it('A2.5: Explain structural vs. nominal typing', () => {
      // Structural Typing (TypeScript):
      // - Types are determined by shape
      // - Any object with the right shape works
      // - No explicit implements needed
      // - Flexible but can cause accidental compatibility
      //
      // Nominal Typing (Java, C#):
      // - Types are determined by name
      // - Must explicitly implement interface
      // - More explicit but requires more boilerplate
      // - Prevents accidental type mixing

      interface Logger {
        log(msg: string): void;
      }

      // Works without explicit implements (structural)
      class ConsoleLogger {
        log(msg: string) { /* log */ }
      }

      const logger: Logger = new ConsoleLogger();
      expect(logger).toBeDefined();
    });

    it('A2.6: Use branded types to prevent accidental mixing', () => {
      // Branded types add nominal-like safety to structural typing
      type UserId = string & { readonly __brand: 'UserId' };
      type Email = string & { readonly __brand: 'Email' };

      function createUserId(value: string): UserId {
        return value as UserId;
      }

      function createEmail(value: string): Email {
        return value as Email;
      }

      const userId = createUserId('123');
      const email = createEmail('alice@example.com');

      // Prevents accidental mixing
      expect(userId).toBe('123');
      expect(email).toBe('alice@example.com');
    });
  });
});
