import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/common/ProductCard';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useProducts } from '@/hooks/useProducts';
import CartPreview from '@/components/common/CartPreview';
import Button from '@/components/common/ButtonRouter';
import Image from 'next/image';
import cartIcon from '@/assets/icons/cart-shopping-solid.svg';
import cartEmpty from '@/assets/icons/ban-solid.svg'
import Head from 'next/head';

function ProductsPage() {
    const { products, loading } = useProducts();
    const {
        cartItems,
        addToCart,
        isInCart,
        total,
        notification,
    } = useCart();


    const [showCart, setShowCart] = useState(false);

    if (loading) {
        return <LoadingSpinner message='Carregando produtos...' />
    }

    return (
        <>
            <Head>
                <title>IAD Eldorado - Produtos</title>
                <meta name="description" content="Lista de produtos disponíveis para compra." />
            </Head>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Produtos</h1>
                    <div className='flex items-center gap-4'>
                        <Button
                            disabled={cartItems.length === 0}
                            rota='/checkout'
                            color={`${cartItems.length > 0 ? 'bg-blue-500' : 'bg-gray-400'} text-white font-bold rounded-full h-12 w-40 hover:bg-blue-800 transition duration-300 md:block`}>
                            {cartItems.length > 0 ? (
                                <div className='flex flex-col items-center'>
                                    <span>Finalizar Pedido</span>
                                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                            ) : (
                                <div className='flex justify-center items-center gap-2'>
                                    <Image src={cartEmpty} alt="Carrinho Vazio" width={15} height={15} />
                                    <span>Carrinho Vazio</span>
                                </div>
                            )}
                        </Button>
                        <button
                            onClick={() => setShowCart(!showCart)}
                            className="relative p-2 bg-blue-100 rounded-lg hover:cursor-pointer"
                        >
                            <Image src={cartIcon} alt='Cart Icon' width={15} height={15} className="h-7 w-7" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className='mb-10 flex flex-col items-center'>
                    <h4 className='font-medium text-center'>A escolha da quantidade de produtos será feita ao finalizar a compra no carrinho</h4>
                </div>

                {notification.visible && (
                    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
                        {notification.message}
                    </div>
                )}

                {showCart && (
                    <CartPreview
                        items={cartItems}
                        total={total}
                        onClose={() => setShowCart(false)}
                    />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={() => addToCart(product)}
                            isInCart={isInCart(product.id!)}
                        />
                    ))}
                </div>
            </div>
        </>
    );

}

export default withAuth([])(ProductsPage); // [] permite acesso sem autenticação