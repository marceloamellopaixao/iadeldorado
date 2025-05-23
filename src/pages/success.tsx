import { useRouter } from "next/router";
import { withAuth } from "@/hooks/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Order } from "@/types/order";
import Head from "next/head";

function SuccessPage() {
    const [order, setOrder] = useState<Order[]>([]);
    const router = useRouter();
    const { orderId } = router.query;
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [validOrder, setValidOrder] = useState(false);

    useEffect(() => {
        let unsubscribe: () => void;

        const verifyOrder = async () => {
            try {
                let q;

                if (user) {
                    q = query(
                        collection(db, 'orders'),
                        where('orderId', '==', orderId),
                        where('clientId', '==', user.uid) // Verifica o ID do cliente
                    );

                    unsubscribe = onSnapshot(q, (querySnapshot) => {
                        const orderData = querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as Order[];
                        setOrder(orderData);
                    });

                    setValidOrder(true);

                } else {
                    const localOrderId = localStorage.getItem('lastOrderId'); // Armazena o ID do pedido no localStorage
                    const localPhone = localStorage.getItem('lastOrderPhone'); // Armazena o telefone no localStorage

                    if (orderId == localOrderId) {
                        q = query(
                            collection(db, 'orders'),
                            where('orderId', '==', localOrderId),
                            where('clientWhatsApp', '==', localPhone) // Verifica o telefone do pedido
                        );

                        unsubscribe = onSnapshot(q, (querySnapshot) => {
                            const orderData = querySnapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as Order[];
                            setOrder(orderData);
                        });

                        setValidOrder(true);
                    } else {
                        setOrder([]);
                        setValidOrder(false);
                        router.push('/products'); // Redireciona se não houver ID de pedido
                    }
                }
            } catch {
                router.push('/products');
            } finally {
                setLoading(false);
            }
        };


        verifyOrder();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [orderId, user, router]);

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <LoadingSpinner message="Verificando seu pedido..." />
            </div>
        )
    }
    
    if (!validOrder) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
                <p className="mb-6">Parece que seu pedido não foi encontrado. Por favor, verifique o ID do pedido.</p>
                <button
                    onClick={() => router.push('/products')}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                    Voltar para Produtos
                </button>
            </div>
        );
    }

    if (!order) return null;

    return (
        <>
            <Head>
                <title>IAD Eldorado - Sucesso</title>
                <meta name="description" content="Confirmação de pedido bem-sucedido." />
            </Head>
            <div className="container mx-auto p-4 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                    <svg
                        className="w-16 h-16 text-green-500 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>

                    <h1 className="text-2xl font-bold mb-4 text-black">Pedido Confirmado!</h1>
                    <p className="mb-6 text-black">Obrigado por sua compra. Seu pedido foi recebido e está sendo processado.</p>

                    {orderId && (
                        <div className="bg-gray-50 p-4 rounded mb-6">
                            <p className="font-medium text-black">Número do Pedido:</p>
                            <p className="text-lg text-black">#{String(orderId?.slice(0, 5)).toUpperCase()}</p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push(userData?.role === 'admin' ? '/admin/products' : '/products')}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                    >
                        {userData?.role === 'admin' ? 'Voltar para o Painel' : 'Voltar para Produtos'}
                    </button>
                    <button
                        onClick={() => router.push('/seller/orders')}
                        className={userData?.role === 'admin' || userData?.role === 'seller' ? 'bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 ml-4' : 'hidden'}
                    >
                        {userData?.role === 'admin' || userData?.role === 'seller' ? 'Ver Pedidos' : ''}
                    </button>
                </div>
            </div>
        </>
    );
}

export default withAuth([])(SuccessPage);