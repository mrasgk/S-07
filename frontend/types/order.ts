export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface CreateOrderPayload {
  dailyCoffeeId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  customerNote?: string;
}

export interface CustomerOrder {
  orderNumber: string;
  coffeeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  statusArabic: string;
  cancellationReason?: string;
  createdAt: string;
  queuePosition?: number;
}

export interface StaffOrder {
  id: string;
  orderNumber: string;
  dailyCoffeeId: string;
  coffeeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  status: OrderStatus;
  statusArabic: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CancelOrderPayload {
  reason: string;
}
