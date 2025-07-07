import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/common/ProductCard';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useProducts } from '@/hooks/useProducts';
import CartPreview from '@/components/common/CartPreview';
import Button from '@/components/common/ButtonRouter';
import Head from 'next/head';
import { FiShoppingCart, FiInfo, FiFrown, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

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

            {/* A tag <main> foi removida daqui. O conteúdo agora é renderizado diretamente dentro do <main> do MainLayout. */}
            <div className="container mx-auto p-4 md:p-8">

                {/* Barra de Título e Ações */}
                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
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
                            className="relative flex items-center justify-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                            aria-label={`Ver carrinho com ${totalItemsInCart} itens`}
                        >
                            <FiShoppingCart size={24} className="text-sky-700" />
                            {totalItemsInCart > 0 && (
                                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {totalItemsInCart}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mensagem Informativa */}
                <div className='mb-8 flex items-center justify-center gap-3 bg-sky-100 text-sky-800 p-3 rounded-lg'>
                    <FiInfo size={20} />
                    <h4 className='font-medium text-center text-sm'>A quantidade de cada produto é ajustada na tela de finalização.</h4>
                </div>

                {/* Notificação de Adicionar ao Carrinho */}
                {notification.visible && (
                    <div className="fixed top-24 right-4 bg-teal-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => {
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
                    })}
                </div>
            </div>
        </>
    );
}

export default withAuth([])(ProductsPage);