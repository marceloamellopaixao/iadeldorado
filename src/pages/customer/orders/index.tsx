import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp, documentId, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { withAuth } from '@/hooks/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Head from 'next/head';
import Link from 'next/link';
import OrderHistoryCard from '@/components/customer/OrderHistoryCard';
import { FiArchive, FiArrowRight } from 'react-icons/fi';

function CustomerOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        let unsubscribe = () => {};

        const processSnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp).toDate(),
                    total: data.items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0)
                } as Order;
            });
            setOrders(ordersData);
            setLoading(false);
        };

        if (user) {
            const q = query(
                collection(db, 'orders'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            unsubscribe = onSnapshot(q, processSnapshot);
        } 
        else {
            const guestOrderIds = JSON.parse(localStorage.getItem('guestOrderIds') || '[]');
            
            if (guestOrderIds.length > 0) {
                const q = query(
                    collection(db, 'orders'),
                    where(documentId(), 'in', guestOrderIds),
                    orderBy('createdAt', 'desc')
                );
                unsubscribe = onSnapshot(q, processSnapshot);
            } else {
                setOrders([]);
                setLoading(false);
            }
        }

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <LoadingSpinner message="Buscando seu histórico..." />;
    }

    return (
        <>
            <Head>
                <title>Meus Pedidos | IAD Eldorado</title>
                <meta name="description" content="Acompanhe seu histórico de pedidos na Cantina IAD Eldorado." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Histórico de Pedidos</h1>
                    <p className="text-slate-500 mt-1">
                        {user ? 'Veja todos os pedidos que você já fez na cantina.' : 'Veja os pedidos recentes feitos neste navegador.'}
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-xl shadow-sm">
                        <FiArchive size={50} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Você ainda não fez nenhum pedido</h3>
                        <p className="text-slate-500 mb-6">Que tal dar uma olhada nos nossos produtos?</p>
                        <Link href="/products" className="bg-sky-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-sky-700 transition-all duration-300 inline-flex items-center gap-2">
                           <span>Ver Produtos</span>
                           <FiArrowRight/>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <OrderHistoryCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default withAuth([])(CustomerOrdersPage);