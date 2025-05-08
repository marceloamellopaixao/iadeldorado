import { useCart } from "@/hooks/useCart";
import { withAuth } from "@/hooks/withAuth";
import { useRouter } from "next/router";
import CheckoutForm from "@/components/common/CheckoutForm";
import CartItemList from "@/components/common/CartItemList";
import { useProducts } from "@/hooks/useProducts";

function CheckoutPage() {
    const { cartItems, total, updateQuantity, removeFromCart } = useCart();
    const { products } = useProducts();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
                <button
                    onClick={() => router.push("/products")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Ver Produtos
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <CartItemList
                        items={cartItems}
                        productStock={products.some(
                            product => product.id === cartItems[0].id) 
                            ? products.find(product => product.id === cartItems[0].id)?.stock : 0}
                        onUpdateQuantity={updateQuantity}
                        onRemoveFromCart={removeFromCart}
                    />
                </div>

                <div className="md:col-span-1">
                    <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
                        <h2 className="text-xl font-bold md-4 text-black">Resumo do Pedido</h2>
                        <div className="space-y-2 mb-4">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="text-black">{item.name} x {item.quantity}</span>
                                    <span className="text-black">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-2 font-bold text-lg flex justify-between">
                            <span className="text-black">Total:</span>
                            <span className="text-black">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>

                    <CheckoutForm cartItems={cartItems} />
                </div>
            </div>
        </div>
    );
}

export default withAuth([])(CheckoutPage);