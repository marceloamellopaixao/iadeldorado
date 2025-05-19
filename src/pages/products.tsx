import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/common/ProductCard';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { useProducts } from '@/hooks/useProducts';
import CartPreview from '@/components/common/CartPreview';
import Button from '@/components/common/ButtonRouter';

function ProductsPage() {
    const { products, loading, error } = useProducts();
    const {
        cartItems,
        addToCart,
        isInCart,
        total,
        notification
    } = useCart();

    const [showCart, setShowCart] = useState(false);

    if (loading) {
        return <LoadingSpinner message='Carregando produtos...' />
    }

    if (error) {
        return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Produtos</h1>
                <div className='flex items-center gap-4'>
                    <Button nameButton='Finalizar Pedido' rota='/checkout' color='bg-blue-500 text-white font-bold rounded-full h-10 w-40 hover:bg-blue-800 transition duration-300' />
                    <button
                        onClick={() => setShowCart(!showCart)}
                        className="relative p-2 bg-blue-100 rounded-lg hover:cursor-pointer"
                    >
                        🛒 {cartItems.length > 0 && (
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
    );

}

export default withAuth([])(ProductsPage); // [] permite acesso sem autenticação