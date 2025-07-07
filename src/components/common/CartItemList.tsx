import { useProducts } from "@/hooks/useProducts";
import { CartItem } from "@/types/order";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

interface CartItemListProps {
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveFromCart: (productId: string) => void;
}

export default function CartItemList({ items, onUpdateQuantity, onRemoveFromCart }: CartItemListProps) {
    const { products } = useProducts();

    return (
        <div className="space-y-4">
            {items.map(item => {
                const product = products.find(p => p.id === item.id);
                const stock = product?.stock ?? 0;

                return (
                    // Cada item agora é um card separado para melhor organização
                    <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                            <p className="text-slate-500 text-sm">
                                R$ {item.price.toFixed(2).replace('.', ',')}
                            </p>
                            <p className={`text-xs mt-1 font-medium ${stock <= 5 ? 'text-rose-600' : 'text-slate-500'}`}>
                                {stock > 0 ? `Apenas ${stock} em estoque!` : 'Sem estoque'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {/* Seletor de quantidade com o mesmo design da página de produtos */}
                            <div className="flex items-center border border-slate-200 rounded-lg">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    <FiMinus size={16} />
                                </button>
                                <span className="px-4 py-2 font-bold text-slate-800">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                    disabled={item.quantity >= stock}
                                >
                                    <FiPlus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => onRemoveFromCart(item.id)}
                                className="p-2 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
                                title="Remover item"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}