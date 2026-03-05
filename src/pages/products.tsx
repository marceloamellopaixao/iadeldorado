import { useState } from "react";
import Head from "next/head";
import { FiAlertTriangle, FiArrowRight, FiCheckCircle, FiFrown, FiInfo, FiShoppingCart } from "react-icons/fi";
import Button from "@/components/common/ButtonRouter";
import CartPreview from "@/components/common/CartPreview";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ProductCard } from "@/components/common/ProductCard";
import { withAuth } from "@/hooks/withAuth";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";

function ProductsPage() {
  const { products, loading } = useProducts();
  const { cartItems, addToCart, isInCart, total, notification } = useCart();
  const [showCart, setShowCart] = useState(false);

  if (loading) {
    return <LoadingSpinner message="Carregando produtos..." />;
  }

  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Head>
        <title>IAD Eldorado - Produtos</title>
        <meta name="description" content="Lista de produtos disponiveis na cantina da IAD Eldorado." />
      </Head>

      <div className="container mx-auto p-4 md:p-8">
        <div className="cantina-panel mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Cantina Digital</p>
            <h1 className="cantina-title text-3xl font-bold">Nossos Produtos</h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              disabled={cartItems.length === 0}
              rota="/checkout"
              color={`font-bold rounded-xl transition-all duration-300 px-4 py-2.5 flex items-center gap-2 ${
                cartItems.length > 0 ? "bg-sky-600 text-white hover:bg-sky-500" : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              {cartItems.length > 0 ? (
                <>
                  <span>Finalizar (R$ {total.toFixed(2).replace(".", ",")})</span>
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
              className="relative flex items-center justify-center rounded-xl border border-[#e7d8be] bg-[#fffdf7] p-3 shadow-sm transition-colors hover:bg-[#f8f2e6]"
              aria-label={`Ver carrinho com ${totalItemsInCart} itens`}
            >
              <FiShoppingCart size={24} className="text-sky-700" />
              {totalItemsInCart > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                  {totalItemsInCart}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3 rounded-xl border border-[#e7d8be] bg-[#f8f2e6] p-4 text-[#5f3711]">
          <FiInfo size={20} />
          <h4 className="text-center text-sm font-medium">A quantidade de cada produto e ajustada na tela de finalizacao.</h4>
        </div>

        {notification.visible && (
          <div className="animate-slide-in fixed right-24 top-48 z-50 flex items-center gap-3 rounded-lg bg-sky-600 px-5 py-3 text-white shadow-lg">
            <FiCheckCircle size={22} />
            <span>{notification.message}</span>
          </div>
        )}

        {showCart && <CartPreview items={cartItems} total={total} onClose={() => setShowCart(false)} />}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products == null || products.length === 0 ? (
            <div className="col-span-full rounded-xl border border-[#e7d8be] bg-[#fffdf7] p-6 text-center shadow-sm">
              <FiAlertTriangle size={48} className="mx-auto text-black-400" />
              <p className="mt-2 text-sm text-slate-500">Todos os produtos estao indisponiveis no momento.</p>
            </div>
          ) : (
            products.map((product) => {
              const cartItem = cartItems.find((item) => item.id === product.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(productData, quantity) => addToCart(productData, quantity)}
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
