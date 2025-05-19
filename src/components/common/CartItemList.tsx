import { useProducts } from "@/hooks/useProducts";
import { CartItem } from "@/types/order";

interface CartItemListProps {
    items: CartItem[]; // Lista de itens do carrinho
    onUpdateQuantity: (productId: string, quantity: number) => void; // Função chamada para atualizar a quantidade do produto no carrinho
    onRemoveFromCart: (productId: string) => void; // Função chamada ao remover o produto do carrinho
}

export default function CartItemList({
    items,
    onUpdateQuantity,
    onRemoveFromCart
}: CartItemListProps) {
    const { products } = useProducts(); // Hook para obter os produtos disponíveis

    // O estoque do produto é obtido pelo ID do produto consultando o Firestore
    const productStock = products.find(product => product.id === items[0].id)?.stock || 0;


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
                                className="px-3 py-1 text-white hover:bg-gray-100 hover:text-black"
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>

                            <span className="px-2">{item.quantity}</span>

                            <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= productStock}
                                className="px-3 py-1 text-white hover:bg-gray-100 hover:text-black"
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