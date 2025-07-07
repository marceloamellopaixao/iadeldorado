import { useCart } from "@/hooks/useCart";
import { withAuth } from "@/hooks/withAuth";
import { useRouter } from "next/router";
import CheckoutForm from "@/components/common/CheckoutForm";
import CartItemList from "@/components/common/CartItemList";
import Head from "next/head";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";

function CheckoutPage() {
    const { cartItems, total, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();

    // Estado de carrinho vazio foi redesenhado
    if (cartItems.length === 0) {
        return (
            <main className="bg-slate-100 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                 <Head>
                    <title>IAD Eldorado - Carrinho Vazio</title>
                </Head>
                <div className="text-center bg-white p-10 rounded-xl shadow-md">
                    <FiShoppingCart size={60} className="mx-auto text-slate-400 mb-4" />
                    <h1 className="text-slate-800 text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
                    <p className="text-slate-500 mb-6">Parece que você ainda não adicionou nenhum item.</p>
                    <button
                        onClick={() => router.push("/products")}
                        className="bg-sky-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-sky-700 transition-all duration-300 flex items-center gap-2 mx-auto"
                    >
                        <FiArrowLeft size={20} />
                        <span>Ver Produtos</span>
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-slate-100 min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <Head>
                    <title>IAD Eldorado - Finalizar Pedido</title>
                    <meta name="description" content="Finalize seu pedido na IAD Eldorado." />
                </Head>
                
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Finalizar Pedido</h1>
                
                {/* Layout de duas colunas */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Coluna da Esquerda: Lista de Itens */}
                    <div className="lg:col-span-2">
                        <CartItemList
                            items={cartItems}
                            onUpdateQuantity={updateQuantity}
                            onRemoveFromCart={removeFromCart}
                        />
                    </div>

                    {/* Coluna da Direita: Resumo e Formulário */}
                    <div className="lg:col-span-1">
                        {/* Card de Resumo do Pedido */}
                        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Resumo</h2>
                            <div className="space-y-3 mb-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-slate-600">
                                        <span>{item.name} x {item.quantity}</span>
                                        <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center font-bold text-xl text-slate-800">
                                <span>Total:</span>
                                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* Formulário de Checkout renderizado abaixo do resumo */}
                        <CheckoutForm cartItems={cartItems} />
                    </div>
                </div>
            </div>
        </main>
    );
}

export default withAuth([])(CheckoutPage);