import { CartItem } from "@/types/order";
import EmptyState from "./EmptyState";
import { useRouter } from "next/router";

interface CartPreviewProps {
    items: CartItem[]; // Lista de itens do carrinho
    total: number; // Total do carrinho
    onClose: () => void; // Função chamada para fechar o preview do carrinho
}

export default function CartPreview({ items, total, onClose }: CartPreviewProps) {
    const router = useRouter(); // Hook do Next.js para manipulação de rotas

    return (
        <div className="fixed inset-0 flex justify-end">
            <div className="bg-white w-full max-w-md h-full p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-black font-bold">Seu Carrinho</h2>
                    <button onClick={onClose} className="text-gray-500">X</button>
                </div>

                {items.length === 0 ? (
                    <EmptyState message="Seu carrinho está vazio" />
                ) : (
                    <>
                        <div className="space-y-4 mb-4">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between border-b pb-2">
                                    <div>
                                        <h3 className="font-medium text-black">{item.name}</h3>
                                        <p className="text-black">R$ {item.price.toFixed(2).replace('.', ',')} x {item.quantity}</p>
                                    </div>
                                    <p className="text-black">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <p className="font-bold text-right text-black">Total: R$ {total.toFixed(2).replace('.', ',')}</p>
                            <button
                                onClick={() => router.push("/checkout")}
                                className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-900 transition duration-300"
                            >
                                Finalizar Compra
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}