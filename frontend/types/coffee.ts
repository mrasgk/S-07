export interface DailyCoffee {
  id: string;
  name: string;
  description?: string;
  origin?: string;
  roastLevel?: string;
  tastingNotes?: string;
  imageUrl?: string;
  price: number;
  availableQuantity: number;
  isAvailable: boolean;
}

export interface CreateCoffeePayload {
  name: string;
  description: string;
  origin: string;
  roastLevel: string;
  tastingNotes: string;
  imageUrl?: string;
  price: number;
  availableQuantity: number;
  isAvailable: boolean;
}

export type UpdateCoffeePayload = CreateCoffeePayload;
