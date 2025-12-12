// Domain Model: E-Commerce Order System
// This chapter demonstrates type inference in TypeScript

describe('Chapter A Section 03: Type Inference', () => {
  describe('1. Inferring Primitive Types', () => {
    it('should infer number type from numeric values', () => {
      const price = 99.99;
      const quantity = 5;
      const total = price * quantity;

      expect(typeof price).toBe('number');
      expect(typeof quantity).toBe('number');
      expect(typeof total).toBe('number');
      expect(total).toBe(499.95);
    });

    it('should infer string type from string values', () => {
      const orderId = 'ORD-001';
      const productName = 'Laptop';
      const description = `Order ${orderId}: ${productName}`;

      expect(typeof orderId).toBe('string');
      expect(typeof productName).toBe('string');
      expect(typeof description).toBe('string');
    });

    it('should infer boolean type from boolean values', () => {
      const isActive = true;
      const isShipped = false;
      const isValid = isActive && !isShipped;

      expect(typeof isActive).toBe('boolean');
      expect(typeof isShipped).toBe('boolean');
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('2. Inferring Object Types', () => {
    it('should infer object shape from object literal', () => {
      const product = {
        id: 'PROD-1',
        name: 'Laptop',
        price: 999.99,
        inStock: true
      };

      expect(product.id).toBe('PROD-1');
      expect(product.name).toBe('Laptop');
      expect(product.price).toBe(999.99);
      expect(product.inStock).toBe(true);
    });

    it('should infer nested object types', () => {
      const order = {
        id: 'ORD-001',
        product: {
          id: 'PROD-1',
          name: 'Laptop'
        },
        quantity: 1,
        total: 999.99
      };

      expect(order.product.id).toBe('PROD-1');
      expect(order.product.name).toBe('Laptop');
    });

    it('should infer optional properties from undefined', () => {
      const order = {
        id: 'ORD-001',
        trackingNumber: undefined
      };

      // TypeScript infers trackingNumber as undefined
      expect(order.trackingNumber).toBeUndefined();
    });
  });

  describe('3. Inferring Array Types', () => {
    it('should infer array of numbers', () => {
      const quantities = [1, 2, 3, 5];

      expect(Array.isArray(quantities)).toBe(true);
      expect(quantities[0]).toBe(1);
      expect(quantities.length).toBe(4);
    });

    it('should infer array of strings', () => {
      const statuses = ['pending', 'shipped', 'delivered'];

      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses[0]).toBe('pending');
      expect(statuses.length).toBe(3);
    });

    it('should infer union type for mixed arrays', () => {
      const mixed = [1, 'two', 3];

      expect(mixed[0]).toBe(1);
      expect(mixed[1]).toBe('two');
      expect(mixed[2]).toBe(3);
    });

    it('should infer array of objects', () => {
      const products = [
        { id: 'PROD-1', name: 'Laptop', price: 999.99 },
        { id: 'PROD-2', name: 'Mouse', price: 29.99 }
      ];

      expect(products[0].name).toBe('Laptop');
      expect(products[1].price).toBe(29.99);
    });
  });

  describe('4. Inferring Function Return Types', () => {
    it('should infer return type from return statement', () => {
      function getOrderId(): string {
        return 'ORD-001';
      }

      const orderId = getOrderId();
      expect(typeof orderId).toBe('string');
      expect(orderId).toBe('ORD-001');
    });

    it('should infer numeric return type', () => {
      function calculateTotal(price: number, quantity: number) {
        return price * quantity;
      }

      const total = calculateTotal(99.99, 5);
      expect(typeof total).toBe('number');
      expect(total).toBe(499.95);
    });

    it('should infer object return type', () => {
      function createProduct(id: string, name: string, price: number) {
        return { id, name, price };
      }

      const product = createProduct('PROD-1', 'Laptop', 999.99);
      expect(product.id).toBe('PROD-1');
      expect(product.name).toBe('Laptop');
      expect(product.price).toBe(999.99);
    });

    it('should infer union return type from conditional', () => {
      function getStatus(isShipped: boolean) {
        return isShipped ? 'shipped' : 'pending';
      }

      const status1 = getStatus(true);
      const status2 = getStatus(false);

      expect(status1).toBe('shipped');
      expect(status2).toBe('pending');
    });

    it('should infer array return type', () => {
      function getOrderIds() {
        return ['ORD-001', 'ORD-002', 'ORD-003'];
      }

      const ids = getOrderIds();
      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBe(3);
    });
  });

  describe('5. When Inference Needs Help', () => {
    it('should require explicit type for empty arrays', () => {
      // Without type annotation, this would be any[]
      const orders: string[] = [];

      orders.push('ORD-001');
      expect(orders[0]).toBe('ORD-001');
    });

    it('should require explicit type for complex objects', () => {
      interface Order {
        id: string;
        status: 'pending' | 'shipped' | 'delivered';
        total: number;
      }

      const orders: Order[] = [];

      orders.push({
        id: 'ORD-001',
        status: 'pending',
        total: 99.99
      });

      expect(orders[0].status).toBe('pending');
    });

    it('should require explicit type for function parameters', () => {
      // Parameters MUST be explicitly typed
      function processOrder(orderId: string, amount: number): boolean {
        return orderId.length > 0 && amount > 0;
      }

      expect(processOrder('ORD-001', 99.99)).toBe(true);
      expect(processOrder('', 99.99)).toBe(false);
    });

    it('should use explicit types for public API boundaries', () => {
      interface OrderResult {
        success: boolean;
        orderId: string;
        message: string;
      }

      function createOrder(productId: string, quantity: number): OrderResult {
        return {
          success: true,
          orderId: 'ORD-001',
          message: 'Order created'
        };
      }

      const result = createOrder('PROD-1', 5);
      expect(result.success).toBe(true);
    });
  });

  describe('6. Inference in Real Code', () => {
    it('should balance inference and explicit types', () => {
      // Domain model - explicit
      interface Product {
        id: string;
        name: string;
        price: number;
      }

      // Function - explicit parameters, inferred return
      function createProduct(id: string, name: string, price: number) {
        return { id, name, price };
      }

      // Variable - inferred type
      const laptop = createProduct('PROD-1', 'Laptop', 999.99);

      // Array - explicit type
      const products: Product[] = [];
      products.push(laptop);

      expect(products[0].name).toBe('Laptop');
    });

    it('should use inference to reduce boilerplate', () => {
      // Without inference (verbose)
      const order1: { id: string; status: string; total: number } = {
        id: 'ORD-001',
        status: 'pending',
        total: 99.99
      };

      // With inference (clean)
      const order2 = {
        id: 'ORD-001',
        status: 'pending',
        total: 99.99
      };

      expect(order1.id).toBe(order2.id);
      expect(order1.status).toBe(order2.status);
      expect(order1.total).toBe(order2.total);
    });

    it('should infer types from function composition', () => {
      function getPrice(product: { price: number }): number {
        return product.price;
      }

      function applyDiscount(price: number, discount: number) {
        return price * (1 - discount);
      }

      const product = { id: 'PROD-1', name: 'Laptop', price: 999.99 };
      const price = getPrice(product);
      const discountedPrice = applyDiscount(price, 0.1);

      expect(typeof discountedPrice).toBe('number');
      expect(discountedPrice).toBe(899.991);
    });
  });

  describe('7. Checkpoint 🫵', () => {
    it('A3.1: Understand when TypeScript infers types', () => {
      // TypeScript infers from:
      // 1. Variable initialization
      const orderId = 'ORD-001'; // ✓ string
      const quantity = 5; // ✓ number

      // 2. Function return statements
      function getTotal(price: number, qty: number) {
        return price * qty; // ✓ number
      }

      // 3. Object literals
      const order = { id: 'ORD-001', total: 99.99 }; // ✓ object shape

      expect(typeof orderId).toBe('string');
      expect(typeof quantity).toBe('number');
      expect(typeof order.id).toBe('string');
    });

    it('A3.2: Know when to use explicit types', () => {
      // Always explicit:
      // 1. Function parameters
      function processOrder(orderId: string, amount: number): boolean {
        return orderId.length > 0 && amount > 0;
      }

      // 2. Empty collections
      const orders: string[] = [];

      // 3. Public API boundaries
      interface OrderResult {
        success: boolean;
        orderId: string;
      }

      const result: OrderResult = {
        success: true,
        orderId: 'ORD-001'
      };

      expect(processOrder('ORD-001', 99.99)).toBe(true);
      expect(orders.length).toBe(0);
      expect(result.success).toBe(true);
    });

    it('A3.3: Balance inference and explicit types', () => {
      // Good balance:
      interface Product {
        id: string;
        name: string;
        price: number;
      }

      // Explicit parameters, inferred return
      function createProduct(id: string, name: string, price: number) {
        return { id, name, price };
      }

      // Inferred variable type
      const product = createProduct('PROD-1', 'Laptop', 999.99);

      // Explicit array type
      const products: Product[] = [product];

      expect(products[0].name).toBe('Laptop');
    });
  });
});
