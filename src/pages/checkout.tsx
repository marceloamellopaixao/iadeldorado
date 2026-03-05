import Head from "next/head";
import { useRouter } from "next/router";
import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import CartItemList from "@/components/common/CartItemList";
import CheckoutForm from "@/components/common/CheckoutForm";
import { withAuth } from "@/hooks/withAuth";
import { useCart } from "@/hooks/useCart";
import { calculateLineTotal } from "@/utils/pricing";

function CheckoutPage() {
  const { cartItems, total, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
        <Head>
          <title>IAD Eldorado - Carrinho Vazio</title>
        </Head>
        <div className="cantina-panel w-full max-w-lg p-10 text-center">
          <FiShoppingCart size={60} className="mx-auto mb-4 text-slate-400" />
          <h1 className="mb-2 text-2xl font-bold text-slate-800">Seu carrinho esta vazio</h1>
          <p className="mb-6 text-slate-500">Parece que voce ainda nao adicionou nenhum item.</p>
          <button
            onClick={() => router.push("/products")}
            className="mx-auto flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 font-bold text-white transition hover:bg-sky-500"
          >
            <FiArrowLeft size={20} />
            <span>Ver Produtos</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Head>
        <title>IAD Eldorado - Finalizar Pedido</title>
        <meta name="description" content="Finalize seu pedido na IAD Eldorado." />
      </Head>

      <div className="cantina-panel mb-8 p-5">
        <h1 className="cantina-title text-3xl font-bold">Finalizar Pedido</h1>
        <p className="cantina-subtitle mt-1 text-sm">Revise os itens, selecione o pagamento e confirme sua compra.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CartItemList items={cartItems} onUpdateQuantity={updateQuantity} onRemoveFromCart={removeFromCart} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-slate-800">Resumo</h2>
            <div className="mb-4 space-y-3">
              {cartItems.map((item) => {
                const lineTotal = calculateLineTotal(item.price, item.quantity, item.pricingTiers);
                return (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">R$ {lineTotal.toFixed(2).replace(".", ",")}</span>
                </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xl font-bold text-slate-800">
              <span>Total:</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <CheckoutForm cartItems={cartItems} />
        </div>
      </div>
    </div>
  );
}

export default withAuth([])(CheckoutPage);
