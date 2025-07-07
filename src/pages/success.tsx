import { useRouter } from "next/router";
import { withAuth } from "@/hooks/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Order } from "@/types/order";
import Head from "next/head";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FiCheckCircle, FiCopy, FiInfo, FiArrowLeft, FiLock } from "react-icons/fi";

const SuccessDisplay = ({ order, router, orderId }) => {
    const { userData } = useAuth(); // userData é necessário para os botões de ação
    
    // Calcula o total do pedido
    const total = useMemo(() =>
        order.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        [order.items]
    );

    return (
        <>
            <Confetti recycle={false} numberOfPieces={500} />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg bg-white p-8 md:p-10 rounded-2xl shadow-xl text-center"
            >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="mx-auto mb-5">
                    <FiCheckCircle className="w-20 h-20 text-teal-500 mx-auto" />
                </motion.div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Pedido Confirmado!</h1>
                <p className="text-slate-600 text-lg mb-8">Obrigado, {order.clientName}! Sua compra foi um sucesso.</p>

                <div className="border-t border-b border-slate-200 py-4 mb-8">
                    <div className="flex justify-between items-center max-w-xs mx-auto">
                        <p className="font-medium text-slate-500">Código do Pedido:</p>
                        <p className="text-lg text-slate-900 font-mono font-bold tracking-wider">#{String(orderId?.slice(0, 5)).toUpperCase()}</p>
                    </div>
                </div>

                {order.paymentMethod === 'pix' && order.selectedPix?.key ? (
                    <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg mb-8 text-left flex flex-col gap-5">
                        <h3 className="font-semibold text-teal-900 mb-2">Instruções para Pagamento via PIX</h3>
                        <div className="bg-slate-100 p-3 rounded-md flex items-center justify-between gap-4">
                            <span className="text-slate-800 font-mono break-all font-semibold">{order.selectedPix.key}</span>
                            <button onClick={() => { navigator.clipboard.writeText(order.selectedPix.key); toast.success('Chave PIX copiada!'); }} className="p-3 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                                <FiCopy />
                            </button>
                        </div>
                        <div className="text-center font-semibold text-teal-800">
                            Valor Total: <span className="font-bold text-lg text-teal-900">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-sky-50 text-sky-800 p-4 rounded-lg mb-8 flex flex-col items-center gap-3 justify-center">
                        <p className="font-bold text-sky-900 text-lg">Valor Total: R$ {total.toFixed(2).replace('.', ',')}</p>
                        <div className="flex items-center gap-2">
                           <FiInfo size={20} />
                           <p className="font-medium">Realize o pagamento na retirada.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => router.push('/products')} className="w-full bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 font-semibold">
                        Ver mais produtos
                    </button>
                    {(userData?.role === 'admin' || userData?.role === 'seller') && (
                        <button onClick={() => router.push('/seller/orders')} className="w-full bg-transparent border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-100 font-semibold">
                            Ver Todos os Pedidos
                        </button>
                    )}
                </div>
            </motion.div>
        </>
    );
};

// --- Componente de Exibição de Erro ---
const ErrorDisplay = ({ title, message, router }) => (
    <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <FiLock size={40} className="mx-auto text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
        <p className="mb-6 text-slate-600">{message}</p>
        <button onClick={() => router.push('/products')} className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 font-semibold flex items-center gap-2 mx-auto">
            <FiArrowLeft/> Voltar para Produtos
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
        if (!orderId || typeof orderId !== 'string') return;

        const fetchAndAuthorizeOrder = async () => {
            setLoading(true);
            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
                    
                    // LÓGICA DE AUTORIZAÇÃO
                    const isAdmin = userData?.role === 'admin';
                    const isOrderOwner = user && orderData.userId === user.uid;
                    const isGuestOwner = !user && localStorage.getItem('lastOrderId') === orderId;

                    if (isAdmin || isOrderOwner || isGuestOwner) {
                        setOrder(orderData);
                        setIsAuthorized(true);
                    } else {
                        // O usuário não tem permissão
                        setIsAuthorized(false);
                        setOrder(null); // Garante que nenhum dado do pedido seja mantido
                    }
                } else {
                    // Pedido não encontrado
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
    }, [orderId, router, user, userData]);

    const getPageTitle = () => {
        if (loading) return 'Carregando...';
        if (isAuthorized) return 'Compra Realizada com Sucesso!';
        return 'Acesso Negado';
    };

    return (
        <>
            <Head>
                <title>{getPageTitle()} | IAD Eldorado</title>
                <meta name="description" content="Confirmação do seu pedido." />
            </Head>

            <div className="flex items-center justify-center h-full p-4">
                {loading && <LoadingSpinner message="Verificando seu pedido..." />}
                
                {!loading && isAuthorized && order && (
                    <SuccessDisplay order={order} router={router} orderId={orderId as string} />
                )}
                
                {!loading && !isAuthorized && (
                    <ErrorDisplay
                        title="Acesso Negado"
                        message="Você não tem permissão para visualizar este pedido ou o pedido não foi encontrado."
                        router={router}
                    />
                )}
            </div>
        </>
    );
}

export default withAuth([])(SuccessPage);