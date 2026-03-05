import { CartItem } from "@/types/order";
import EmptyState from "./EmptyState";
import { useRouter } from "next/router";
import { FiArrowRight, FiX } from "react-icons/fi";
import { calculateLineTotal } from "@/utils/pricing";

interface CartPreviewProps {
    items: CartItem[];
    total: number;
    onClose: () => void;
}

export default function CartPreview({ items, total, onClose }: CartPreviewProps) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/60" onClick={onClose}>
            <aside
                className="flex h-full w-full max-w-sm flex-col border-l border-[#e7d8be] bg-[#fffdf7] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Seu Carrinho</h2>
                    <button onClick={onClose} className="p-2 transition-colors rounded-full text-slate-500 hover:bg-slate-200">
                        <FiX size={22} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <EmptyState message="Seu carrinho ainda esta vazio." />
                ) : (
                    <>
                        <div className="flex-grow pr-1 mb-4 space-y-4 overflow-y-auto">
                            {items.map((item) => {
                                const lineTotal = calculateLineTotal(item.price, item.quantity, item.pricingTiers);
                                return (
                                <div key={item.id} className="rounded-xl border border-[#eadfca] bg-[#fdf8ef] p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold text-slate-700">{item.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                R$ {item.price.toFixed(2).replace(".", ",")} x {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-slate-800">
                                            R$ {lineTotal.toFixed(2).replace(".", ",")}
                                        </p>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-medium text-slate-600">Total:</p>
                                <p className="text-2xl font-black text-slate-800">R$ {total.toFixed(2).replace(".", ",")}</p>
                            </div>
                            <button
                                onClick={() => router.push("/checkout")}
                                className="flex items-center justify-center w-full gap-2 py-3 mt-2 font-bold text-white transition rounded-xl bg-sky-600 hover:bg-sky-500"
                            >
                                <span>Finalizar Compra</span>
                                <FiArrowRight size={18} />
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
