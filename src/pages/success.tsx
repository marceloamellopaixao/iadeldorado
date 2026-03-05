import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FiArrowLeft, FiCheckCircle, FiCopy, FiInfo, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import { withAuth } from "@/hooks/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Order } from "@/types/order";
import { calculateCartItemTotal } from "@/utils/pricing";

interface SuccessDisplayProps {
  order: Order;
  router: NextRouter;
  orderId: string;
}

const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ order, router, orderId }) => {
  const { userData } = useAuth();

  const total = useMemo(
    () => order.items.reduce((acc, item) => acc + calculateCartItemTotal(item), 0),
    [order.items],
  );

  return (
    <>
      <Confetti recycle={false} numberOfPieces={500} />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-lg rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-8 text-center shadow-xl md:p-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mx-auto mb-5"
        >
          <FiCheckCircle className="mx-auto h-20 w-20 text-sky-600" />
        </motion.div>

        <h1 className="mb-2 text-3xl font-bold text-slate-800">Pedido Confirmado!</h1>
        <p className="mb-8 text-lg text-slate-600">Obrigado, {order.clientName}! Sua compra foi um sucesso.</p>

        <div className="mb-8 border-b border-t border-slate-200 py-4">
          <div className="mx-auto flex max-w-xs items-center justify-between">
            <p className="font-medium text-slate-500">Codigo do Pedido:</p>
            <p className="text-lg font-bold tracking-wider text-slate-900">#{String(orderId?.slice(0, 5)).toUpperCase()}</p>
          </div>
        </div>

        {order.paymentMethod === "pix" && order.selectedPix?.key ? (
          <div className="mb-8 flex flex-col gap-5 rounded-lg border border-[#e7d8be] bg-[#f8f2e6] p-6 text-left">
            <h3 className="mb-2 font-semibold text-slate-800">Instrucoes para Pagamento via PIX</h3>
            <div className="flex items-center justify-between gap-4 rounded-md bg-slate-100 p-3">
              <span className="break-all font-mono font-semibold text-slate-800">{order.selectedPix.key}</span>
              <button
                onClick={() => {
                  if (order.selectedPix?.key) {
                    navigator.clipboard.writeText(order.selectedPix.key);
                    toast.success("Chave PIX copiada!");
                  }
                }}
                className="rounded-lg bg-slate-200 p-3 text-slate-600 hover:bg-slate-300"
              >
                <FiCopy />
              </button>
            </div>
            <div className="text-center font-semibold text-slate-700">
              Valor Total: <span className="text-lg font-bold text-slate-800">R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center justify-center gap-3 rounded-lg border border-[#e7d8be] bg-[#f8f2e6] p-4 text-[#5f3711]">
            <p className="text-lg font-bold">Valor Total: R$ {total.toFixed(2).replace(".", ",")}</p>
            <div className="flex items-center gap-2">
              <FiInfo size={20} />
              <p className="font-medium">Realize o pagamento na retirada.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button onClick={() => router.push("/products")} className="w-full rounded-lg bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-500">
            Ver mais produtos
          </button>
          {(userData?.role === "admin" || userData?.role === "seller") && (
            <button
              onClick={() => router.push("/seller/orders")}
              className="w-full rounded-lg border border-slate-300 bg-transparent px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Ver Todos os Pedidos
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

interface ErrorDisplayProps {
  title: string;
  message: string;
  router: NextRouter;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message, router }) => (
  <div className="w-full max-w-md rounded-xl border border-[#e7d8be] bg-[#fffdf7] p-8 text-center shadow-lg">
    <FiLock size={40} className="mx-auto mb-4 text-rose-500" />
    <h1 className="mb-4 text-2xl font-bold text-slate-800">{title}</h1>
    <p className="mb-6 text-slate-600">{message}</p>
    <button onClick={() => router.push("/products")} className="mx-auto flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 font-semibold text-white hover:bg-sky-500">
      <FiArrowLeft /> Voltar para Produtos
    </button>
  </div>
);

function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { orderId } = router.query;
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!orderId || typeof orderId !== "string") return;

    const fetchAndAuthorizeOrder = async () => {
      setLoading(true);
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          const isAdmin = userData?.role === "admin";
          const isOrderOwner = user && orderData.userId === user.uid;

          let isGuestOwner = false;
          if (!user) {
            const guestOrderIds = JSON.parse(localStorage.getItem("guestOrderIds") || "[]");
            if (guestOrderIds.includes(orderId)) {
              isGuestOwner = true;
            }
          }

          if (isAdmin || isOrderOwner || isGuestOwner) {
            setOrder(orderData);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            setOrder(null);
          }
        } else {
          setOrder(null);
          setIsAuthorized(false);
        }
      } catch {
        toast.error("Erro ao buscar o pedido.");
        setOrder(null);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAndAuthorizeOrder();
  }, [orderId, user, userData]);

  const getPageTitle = () => {
    if (loading) return "Carregando...";
    if (isAuthorized) return "Compra Realizada com Sucesso!";
    return "Acesso Negado";
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()} | IAD Eldorado</title>
        <meta name="description" content="Confirmacao do seu pedido." />
      </Head>

      <div className="flex h-full items-center justify-center p-4 md:p-8">
        {loading && <LoadingSpinner message="Verificando seu pedido..." />}

        {!loading && isAuthorized && order && <SuccessDisplay order={order} router={router} orderId={orderId as string} />}

        {!loading && !isAuthorized && (
          <ErrorDisplay
            title="Acesso Negado"
            message="Voce nao tem permissao para visualizar este pedido ou o pedido nao foi encontrado."
            router={router}
          />
        )}
      </div>
    </>
  );
}

export default withAuth([])(SuccessPage);
