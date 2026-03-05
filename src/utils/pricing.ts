import { PricingTier } from "@/types/product";
import { CartItem } from "@/types/order";

const sanitizeTiers = (tiers: PricingTier[] = []) =>
  tiers
    .filter((tier) => tier.quantity > 0 && tier.totalPrice >= 0)
    .map((tier) => ({
      quantity: Math.floor(tier.quantity),
      totalPrice: Number(tier.totalPrice),
    }))
    .filter((tier) => tier.quantity > 0)
    .sort((a, b) => a.quantity - b.quantity);

export const formatCurrencyBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const calculateLineTotal = (unitPrice: number, quantity: number, tiers: PricingTier[] = []) => {
  if (quantity <= 0) {
    return 0;
  }

  const normalized = sanitizeTiers(tiers);
  if (normalized.length === 0) {
    return unitPrice * quantity;
  }

  // Oferta ativa: quando houver promocao cadastrada, o carrinho cobra por "pacote".
  // Ex.: oferta 5 por R$8 => quantidade 2 no carrinho = 2 pacotes => R$16.
  const activeTier = normalized.reduce((best, tier) => {
    const tierUnitValue = tier.totalPrice / tier.quantity;
    const bestUnitValue = best.totalPrice / best.quantity;
    return tierUnitValue < bestUnitValue ? tier : best;
  }, normalized[0]);

  return Number((activeTier.totalPrice * quantity).toFixed(2));
};

export const calculateCartItemTotal = (item: CartItem) => {
  if (typeof item.lineTotal === "number" && Number.isFinite(item.lineTotal)) {
    return Number(item.lineTotal);
  }
  return calculateLineTotal(item.price, item.quantity, item.pricingTiers);
};

export const getSavingsAmount = (unitPrice: number, quantity: number, tiers: PricingTier[] = []) => {
  const regularTotal = unitPrice * quantity;
  const promoTotal = calculateLineTotal(unitPrice, quantity, tiers);
  return Number(Math.max(0, regularTotal - promoTotal).toFixed(2));
};

export const getTierBadgeText = (tier: PricingTier) =>
  `${tier.quantity} por ${formatCurrencyBRL(tier.totalPrice)}`;
