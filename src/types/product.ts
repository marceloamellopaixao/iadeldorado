export interface PricingTier {
  quantity: number;
  totalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: boolean;
  imageUrl?: string;
  imagePath?: string;
  pricingTiers?: PricingTier[];
  createdAt: Date;
  updatedAt?: Date;
}

