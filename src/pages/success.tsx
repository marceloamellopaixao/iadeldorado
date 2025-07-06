import { useRouter } from "next/router";
import { withAuth } from "@/hooks/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Order } from "@/types/order";
import Head from "next/head";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FiCheckCircle, FiCopy } from "react-icons/fi";

function SuccessPage() {
    const [order, setOrder] = useState<Order[]>([]);
    const router = useRouter();
    const { orderId } = router.query;
    const { userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [validOrder, setValidOrder] = useState(false);


    useEffect(() => {
        if (!orderId) return;
        setLoading(true);
        const fetchOrder = async () => {
            try {
                const orderRef = doc(db, 'orders', String(orderId));
                const orderSnap = await getDoc(orderRef);
                if (orderSnap.exists()) {
                    setOrder([{ id: orderSnap.id, ...orderSnap.data() } as Order]);
                    setValidOrder(true);
                } else {
                    setOrder([]);
                    setValidOrder(false);
                    router.push('/products');
                }
            } catch {
                setOrder([]);
                setValidOrder(false);
                router.push('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <LoadingSpinner message="Verificando seu pedido..." />
            </div>
        )
    }

    if (!validOrder) {
        const title = !validOrder ? "Pedido não encontrado" : "Acesso Negado";
        const message = !validOrder 
            ? "Parece que o pedido que você está tentando acessar não existe." 
            : "Você não tem permissão para visualizar este pedido.";

        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
                    <p className="mb-6 text-slate-600">{message}</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                    >
                        Voltar para Produtos
                    </button>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <>
            <Head>
                <title>Compra Realizada com Sucesso! | IAD Eldorado</title>
                <meta name="description" content="Confirmação de pedido bem-sucedido." />
            </Head>

            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                tweenDuration={10000}
            />

            <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-xl text-center">
                    
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                        className="mx-auto mb-5"
                    >
                        <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Pedido Confirmado!</h1>
                    <p className="text-slate-600 text-lg mb-8">
                        Obrigado, {userData?.name || 'cliente'}! Sua compra foi um sucesso e já estamos cuidando de tudo.
                    </p>

                    <div className="border-t border-b border-slate-200 py-4 mb-8">
                        <div className="flex justify-between items-center max-w-xs mx-auto">
                            <p className="font-medium text-slate-500">Código do Pedido:</p>
                            <p className="text-lg text-slate-900 font-mono font-bold tracking-wider">#{String(orderId?.slice(0, 5)).toUpperCase()}</p>
                        </div>
                    </div>

                    {order[0]?.paymentMethod === 'pix' && order[0]?.selectedPix?.key ? (
                        <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8 text-left flex flex-col gap-5">
                            <div>
                                <h3 className="font-semibold text-green-900 mb-2">Instruções para Pagamento via PIX</h3>
                                <p className="text-sm text-green-800">Para finalizar, faça a transferência usando a chave abaixo e nos envie o comprovante.</p>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-md flex items-center justify-between gap-4">
                               <div className="flex flex-col">
                                 <span className="text-xs text-slate-500">Chave PIX (E-mail)</span>
                                 <span className="text-slate-800 font-mono break-all font-semibold">{order[0]?.selectedPix?.key}</span>
                               </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(order[0]?.selectedPix?.key || '');
                                        toast.success('Chave PIX copiada!', {
                                            position: "top-center",
                                            autoClose: 2000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                        });
                                    }}
                                    className="p-3 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                                    aria-label="Copiar chave PIX"
                                >
                                    <FiCopy />
                                </button>
                            </div>
                             <div className="text-center font-semibold text-green-800">
                                Valor Total: <span className="font-bold text-lg text-green-900">R$ {order[0]?.items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 p-4 rounded-lg mb-8">
                            <p className="font-medium text-yellow-800">Seu pedido será pago diretamente na cantina.</p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => router.push(userData?.role === 'admin' ? '/admin/products' : '/products')}
                            className="w-full bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors font-semibold"
                        >
                            {userData?.role === 'admin' ? 'Ir para o Painel' : 'Ver mais produtos'}
                        </button>
                        {(userData?.role === 'admin' || userData?.role === 'seller') && (
                             <button
                                onClick={() => router.push('/seller/orders')}
                                className="w-full bg-transparent border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
                            >
                                Ver Todos os Pedidos
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth([])(SuccessPage);