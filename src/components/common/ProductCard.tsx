import { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { FiMinus, FiPlus, FiShoppingCart, FiSlash } from "react-icons/fi";
import { calculateLineTotal, formatCurrencyBRL, getSavingsAmount, getTierBadgeText } from "@/utils/pricing";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  isInCart: boolean;
  quantityInCart: number;
}

export function ProductCard({ product, onAddToCart, isInCart, quantityInCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const availableStock = product.stock - quantityInCart;
  const canAddToCart = availableStock > 0;

  useEffect(() => {
    if (quantity > availableStock) {
      setQuantity(Math.max(1, availableStock));
    }
    if (availableStock <= 0) {
      setQuantity(1);
    }
  }, [availableStock, quantity]);

  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrement = () => setQuantity((prev) => Math.min(prev + 1, availableStock));
  const lineTotal = calculateLineTotal(product.price, quantity, product.pricingTiers);
  const savingsAmount = getSavingsAmount(product.price, quantity, product.pricingTiers);

  const buttonStyle = !canAddToCart
    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
    : "bg-sky-600 hover:bg-sky-500 text-white";

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-5 shadow-[0_10px_25px_rgba(95,55,17,0.10)] transition hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(95,55,17,0.14)]">
      <div>
        <div className="relative mb-4 h-36 overflow-hidden rounded-xl border border-[#e7d8be] bg-[#f8f2e6]">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-bold tracking-[0.12em] text-[#8b5e34]">
              FOTO PRODUTO
            </div>
          )}
        </div>
        <h3 className="mb-2 text-lg font-bold text-slate-800">{product.name}</h3>
        <p className="min-h-[40px] text-sm text-slate-600">{product.description || "Sem descricao."}</p>
        {(product.pricingTiers || []).length > 0 && (
          <p className="mt-2 text-xs font-bold text-[#8b5e34]">
            Oferta: {(product.pricingTiers || []).map(getTierBadgeText).join(" | ")}
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-600">Unitario: {formatCurrencyBRL(product.price)}</p>
        <p className="text-xl font-black text-slate-800">Total atual: {formatCurrencyBRL(lineTotal)}</p>
        {savingsAmount > 0 && <p className="text-xs font-bold text-[#8b5e34]">Voce economiza {formatCurrencyBRL(savingsAmount)}</p>}
        <p className={`mt-1 text-sm font-semibold ${!canAddToCart ? "text-rose-500" : "text-slate-600"}`}>
          {product.stock <= 0
            ? "Produto esgotado"
            : !canAddToCart
              ? "Voce ja adicionou todo o estoque"
              : `Disponivel: ${availableStock}`}
        </p>

        <div className="my-3 flex items-center justify-center gap-4">
          <button
            onClick={handleDecrement}
            disabled={!canAddToCart || quantity <= 1}
            className="rounded-full bg-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiMinus size={16} />
          </button>
          <span className="flex w-8 items-center justify-center text-xl font-bold text-slate-800">
            {canAddToCart ? quantity : <FiSlash />}
          </span>
          <button
            onClick={handleIncrement}
            disabled={!canAddToCart || quantity >= availableStock}
            className="rounded-full bg-slate-200 p-2 text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} />
          </button>
        </div>

        <button
          onClick={() => onAddToCart(product, quantity)}
          disabled={!canAddToCart}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition ${buttonStyle}`}
        >
          {!canAddToCart ? (
            <>
              <FiSlash size={18} />
              <span>Indisponivel</span>
            </>
          ) : isInCart ? (
            <>
              <FiPlus size={18} />
              <span>Adicionar mais {quantity}</span>
            </>
          ) : (
            <>
              <FiShoppingCart size={18} />
              <span>Adicionar ao Carrinho</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
