// Tipos para produtos
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imagem_url: string;
  category: string;
  stock: number;
  compatibility: string[];
  featured?: boolean;
}

// Tipos para cores dos produtos
export interface ProductColor {
  id: string; // UUID
  productId?: string; // UUID, pode ser nulo
  name: string; // Nome da cor
  hexCode: string; // Código hexadecimal da cor
  stock: number; // Estoque disponível
  createdAt?: string; // Data de criação, pode ser nulo
  image_url?: string; // URL da imagem, pode ser nulo
}

// Tipos para pedidos
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  shippingFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  createdAt: string;
  notes?: string;
}

// Tipos para endereço
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// Tipos para comentários/avaliações
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Tipos para métricas do dashboard
export interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  percentage: number;
}

export type OrderStatus =
  | "pending" // Aguardando pagamento
  | "paid" // Pago
  | "shipped" // Enviado
  | "delivered" // Entregue
  | "canceled"; // Cancelado

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "bank_slip"
  | "pix"
  | "cash"
  | "store_credit"
  | "mercado_pago";

export interface SalesByPeriod {
  period: string;
  sales: number;
}
