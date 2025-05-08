import { CartItem } from "@/types/order";
import { Product } from "@/types/product";
import { useEffect } from "react";

interface CartItemListProps {
    items: CartItem[]; // Lista de itens do carrinho
    productStock: any; // Estoque do produto
    onUpdateQuantity: (productId: string, quantity: number) => void; // Função chamada para atualizar a quantidade do produto no carrinho
    onRemoveFromCart: (productId: string) => void; // Função chamada ao remover o produto do carrinho
}

export default function CartItemList({
    items,
    productStock,
    onUpdateQuantity,
    onRemoveFromCart
}: CartItemListProps) {

    return (
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="border-b pb-4 flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-gray-600">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded">
                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>

                            <span className="px-2">{item.quantity}</span>

                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1 > productStock ? productStock : item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Remover
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}