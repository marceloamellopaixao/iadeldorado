import { useProducts } from "@/hooks/useProducts";
import { CartItem } from "@/types/order";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { calculateLineTotal, getTierBadgeText } from "@/utils/pricing";

interface CartItemListProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
}

export default function CartItemList({ items, onUpdateQuantity, onRemoveFromCart }: CartItemListProps) {
    const { products } = useProducts();

    return (
        <div className="space-y-4">
            {items.map((item) => {
                const product = products.find((p) => p.id === item.id);
                const stock = product?.stock ?? 0;
                const lineTotal = calculateLineTotal(item.price, item.quantity, item.pricingTiers);

                return (
                    <article
                        key={item.id}
                        className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-4 shadow-sm sm:flex-row"
                    >
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                            <p className="text-sm text-slate-500">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                            {(item.pricingTiers || []).length > 0 && (
                                <p className="mt-1 text-xs font-semibold text-[#8b5e34]">
                                    Ofertas: {(item.pricingTiers || []).map(getTierBadgeText).join(" | ")}
                                </p>
                            )}
                            <p className={`mt-1 text-xs font-medium ${stock <= 5 ? "text-rose-600" : "text-slate-500"}`}>
                                {stock > 0 ? `Apenas ${stock} em estoque!` : "Sem estoque"}
                            </p>
                            <p className="mt-2 text-sm font-bold text-slate-700">Subtotal: R$ {lineTotal.toFixed(2).replace(".", ",")}</p>
                        </div>

                        <div className="flex w-full items-center gap-4 sm:w-auto">
                            <div className="flex items-center rounded-xl border border-slate-200 bg-[#f8f2e6]">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="px-3 py-2 text-slate-600 hover:bg-[#efe1c9] disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    <FiMinus size={16} />
                                </button>
                                <span className="px-4 py-2 font-bold text-slate-800">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="px-3 py-2 text-slate-600 hover:bg-[#efe1c9] disabled:opacity-50"
                                    disabled={item.quantity >= stock}
                                >
                                    <FiPlus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => onRemoveFromCart(item.id)}
                                className="rounded-full p-2 text-rose-600 transition-colors hover:bg-rose-100"
                                title="Remover item"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
