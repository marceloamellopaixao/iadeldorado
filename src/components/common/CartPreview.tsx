import { CartItem } from "@/types/order";
import EmptyState from "./EmptyState";
import { useRouter } from "next/router";
import { FiX, FiArrowRight } from "react-icons/fi";

interface CartPreviewProps {
    items: CartItem[];
    total: number;
    onClose: () => void;
}

export default function CartPreview({ items, total, onClose }: CartPreviewProps) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="bg-slate-50 w-full max-w-sm h-full shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ease-in-out" 
                onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do carrinho o feche
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl text-slate-800 font-bold">Seu Carrinho</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-slate-200">
                        <FiX size={24} />
                    </button>
                </div>

                {items.length === 0 ? (
                    <EmptyState message="Seu carrinho ainda está vazio." />
                ) : (
                    <>
                        {/* Lista de Itens */}
                        <div className="flex-grow space-y-4 mb-4 overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-start border-b border-slate-200 pb-3">
                                    <div>
                                        <h3 className="font-bold text-slate-700">{item.name}</h3>
                                        <p className="text-slate-500 text-sm">
                                            R$ {item.price.toFixed(2).replace('.', ',')} x {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-slate-800">
                                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Rodapé do Carrinho */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-slate-600 font-medium">Total:</p>
                                <p className="font-bold text-2xl text-slate-800">R$ {total.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <button
                                onClick={() => router.push("/checkout")}
                                className="w-full mt-2 bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                            >
                                <span>Finalizar Compra</span>
                                <FiArrowRight size={20} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}