import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/common/ProductCard';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useProducts } from '@/hooks/useProducts';
import CartPreview from '@/components/common/CartPreview';
import Button from '@/components/common/ButtonRouter';
import Head from 'next/head';
import { FiShoppingCart, FiInfo, FiFrown, FiCheckCircle, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';

function ProductsPage() {
    const { products, loading } = useProducts();
    const { cartItems, addToCart, isInCart, total, notification } = useCart();
    const [showCart, setShowCart] = useState(false);

    if (loading) {
        return <LoadingSpinner message='Carregando produtos...' />;
    }

    const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Head>
                <title>IAD Eldorado - Produtos</title>
                <meta name="description" content="Lista de produtos disponíveis na cantina da IAD Eldorado." />
            </Head>

            <div className="container p-4 mx-auto">

                {/* Barra de Título e Ações */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Nossos Produtos</h1>
                    <div className='flex items-center justify-center gap-3'>
                        <Button
                            disabled={cartItems.length === 0}
                            rota='/checkout'
                            color={`font-bold rounded-lg transition-all duration-300 transform hover:scale-105 px-4 py-2.5 flex items-center gap-2 ${cartItems.length > 0 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
                        >
                            {cartItems.length > 0 ? (
                                <>
                                    <span>Finalizar (R$ {total.toFixed(2).replace('.', ',')})</span>
                                    <FiArrowRight size={20} />
                                </>
                            ) : (
                                <>
                                    <FiFrown size={20} />
                                    <span>Carrinho Vazio</span>
                                </>
                            )}
                        </Button>

                        <button
                            onClick={() => setShowCart(true)}
                            className="relative flex items-center justify-center p-3 transition-colors bg-white border rounded-lg shadow-sm border-slate-200 hover:bg-slate-100"
                            aria-label={`Ver carrinho com ${totalItemsInCart} itens`}
                        >
                            <FiShoppingCart size={24} className="text-sky-700" />
                            {totalItemsInCart > 0 && (
                                <span className="absolute flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full -top-2 -right-2 bg-rose-500">
                                    {totalItemsInCart}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mensagem Informativa */}
                <div className='flex items-center justify-center gap-3 p-3 mb-8 rounded-lg bg-sky-100 text-sky-800'>
                    <FiInfo size={20} />
                    <h4 className='text-sm font-medium text-center'>A quantidade de cada produto é ajustada na tela de finalização.</h4>
                </div>

                {/* Notificação de Adicionar ao Carrinho */}
                {notification.visible && (
                    <div className="fixed z-50 flex items-center gap-3 px-5 py-3 text-white bg-teal-500 rounded-lg shadow-lg right-24 top-48 animate-slide-in">
                        <FiCheckCircle size={22} />
                        <span>{notification.message}</span>
                    </div>
                )}

                {/* Preview do Carrinho */}
                {showCart && (
                    <CartPreview
                        items={cartItems}
                        total={total}
                        onClose={() => setShowCart(false)}
                    />
                )}

                {/* Grade de Produtos */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products == null || products.length === 0 ? (
                        <div className="p-6 text-center bg-white border rounded-lg shadow-sm col-span-full border-slate-200">
                            <FiAlertTriangle size={48} className="mx-auto text-black-400" />
                            <p className="mt-2 text-sm text-slate-500">Todos os produtos estão indisponíveis no momento.</p>
                        </div>
                    ) : (
                        products.map(product => {
                            const cartItem = cartItems.find(item => item.id === product.id);
                            const quantityInCart = cartItem ? cartItem.quantity : 0;

                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={(product, quantity) => addToCart(product, quantity)}
                                    isInCart={isInCart(product.id!)}
                                    quantityInCart={quantityInCart}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth([])(ProductsPage);