// Abstraction: Define the contract
export interface Product {
  id: string;
  name: string;
  getPrice(): number;
}

// Implementations
export class PhysicalProduct implements Product {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

   private TRANSPORT_FEES_RATE = 0.1;

  getPrice(): number {
    return this.price + this.price * this.TRANSPORT_FEES_RATE;
  }
}

export class DigitalProduct implements Product {
  constructor(readonly id: string, readonly name: string, readonly price: number) {}

  getPrice(): number {
    return this.price;
  }
}
