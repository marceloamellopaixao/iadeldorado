import { PricingTier } from "./product";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  pricingTiers?: PricingTier[];
  lineTotal?: number;
}

export type PixType = "cpf" | "cnpj" | "email" | "celular" | "aleatorio";

export interface PixDetails {
  name: string;
  keyType: PixType;
  key: string;
  owner: string;
}

export type OrderStatus =
  | "pendente"
  | "preparando"
  | "concluido"
  | "entregue"
  | "cancelado"
  | "pagamento pendente"
  | "pago"
  | "nao pago"
  | "não pago"
  | "nÃ£o pago"
  | "nÃƒÂ£o pago";

export type PaymentType =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito"
  | "cartao de credito"
  | "cartao de debito"
  | "cartão de crédito"
  | "cartão de débito"
  | "cartÃ£o de crÃ©dito"
  | "cartÃ£o de dÃ©bito";

export interface Order {
  id: string;
  clientName: string;
  clientWhatsApp: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentType;
  selectedPix?: PixDetails;
  status: OrderStatus;
  userId: string | null;
  createdAt: Date;
  updatedAt?: Date;
  lastOrderId?: string;
  lastOrderPhone?: string;
  cantinaId: string;
}

