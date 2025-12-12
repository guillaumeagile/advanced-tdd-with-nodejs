// Abstraction: Define the contract
export interface Product {
  id: string;
  name: string;
  getPrice(): number;
}

// Implementations
export class PhysicalProduct implements Product {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  getPrice(): number {
    return this.price;
  }
}

export class DigitalProduct implements Product {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  getPrice(): number {
    return this.price;
  }
}
