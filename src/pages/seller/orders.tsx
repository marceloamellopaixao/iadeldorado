import { useState, useEffect } from 'react';
import { collection, query, where, updateDoc, doc, onSnapshot, orderBy, increment, deleteDoc, Timestamp, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types/order';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import OrderCard from '@/components/seller/OrderCard';
import { FiInbox } from "react-icons/fi";

function SellerOrdersPage() {
    const { userData } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
    const [cantinaFilter, setCantinaFilter] = useState<string | 'todos'>('todas');
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        const baseQuery = collection(db, 'orders');
        const queryConstraints: QueryConstraint[] = [];

        if (statusFilter === 'todos') {
            queryConstraints.push(where('status', 'not-in', ['entregue', 'cancelado', 'não pago']));
        } else {
            queryConstraints.push(where('status', '==', statusFilter));
        }

        if (cantinaFilter !== 'todas') {
            queryConstraints.push(where('cantinaId', '==', cantinaFilter));
        }

        if (statusFilter === 'todos') {
            queryConstraints.push(orderBy('status'));
        }
        queryConstraints.push(orderBy('createdAt', 'desc'));

        const q = query(baseQuery, ...queryConstraints);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp).toDate(),
                    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
                    total: data.items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0)
                } as Order;
            });
            setOrders(ordersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [statusFilter, cantinaFilter]);

    const deleteOrder = async (orderId: string) => {
        if (!confirm("Tem certeza? Esta ação devolverá os itens ao estoque e removerá o pedido permanentemente.")) return;
        setDeletingOrderId(orderId);
        try {
            const orderRef = doc(db, 'orders', orderId);
            const order = orders.find((o) => o.id === orderId);
            if (!order) throw new Error('Pedido não encontrado');

            const stockUpdatePromises = order.items.map(item =>
                updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) })
            );

            await Promise.all(stockUpdatePromises);
            await deleteDoc(orderRef);
            toast.success(`Pedido #${orderId.slice(0, 5)} excluído com sucesso.`);
        } catch {
            toast.error("Erro ao excluir o pedido.");
        } finally {
            setDeletingOrderId(null);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const order = orders.find((o) => o.id === orderId);
            if (!order) throw new Error('Pedido não encontrado');

            if (newStatus === 'cancelado') {
                const stockUpdatePromises = order.items.map(item =>
                    updateDoc(doc(db, 'products', item.id), { stock: increment(item.quantity) })
                );
                await Promise.all(stockUpdatePromises);
            }

            await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
            toast.info(`Status do pedido #${orderId.slice(0, 5)} atualizado para "${newStatus}".`);
        } catch {
            toast.error("Erro ao atualizar o status do pedido.");
        }
    };

    const statusFilters: { label: string; value: OrderStatus | 'todos' }[] = [
        { label: 'Ativos', value: 'todos' },
        { label: 'Pendentes', value: 'pendente' },
        { label: 'Preparando', value: 'preparando' },
        { label: 'Pag. Pendente', value: 'pagamento pendente' },
        { label: 'Pago', value: 'pago' },
        { label: 'Não Pago', value: 'não pago' },
        { label: 'Concluído', value: 'concluido' },
        { label: 'Entregue', value: 'entregue' },
        { label: 'Cancelado', value: 'cancelado' },
    ];

    const cantinaFilters: { label: string; value: string }[] = [
        { label: 'Todas', value: 'todas' },
        { label: 'Crianças', value: 'criancas' },
        { label: 'Jovens', value: 'jovens' },
        { label: 'Irmãs', value: 'irmas' },
        { label: 'Missões', value: 'missoes' },
    ];

    if (loading) {
        return <LoadingSpinner message='Carregando pedidos...' />;
    }

    return (
        <>
            <Head>
                <title>Gerenciar Pedidos | IAD Eldorado</title>
                <meta name="description" content="Acompanhe e gerencie os pedidos da cantina." />
            </Head>
            <div className="container p-4 mx-auto md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Gerenciar Pedidos</h1>
                    <p className="mt-1 text-slate-500">Acompanhe e atualize o status dos pedidos em tempo real.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pb-4 mb-6 border-b border-slate-200">
                    {statusFilters.map(({ label, value }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${statusFilter === value
                                ? 'bg-sky-600 text-white shadow'
                                : 'bg-white text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* DROPDOWN FILTRO DE CANTINA */}
                <div className="flex flex-wrap items-center gap-2 pb-4 mb-6">
                    <span className="mr-2 font-semibold text-slate-600">Cantina:</span>
                    <select
                        value={cantinaFilter}
                        onChange={(e) => setCantinaFilter(e.target.value)}
                        className="px-3 py-2 bg-white border rounded-lg text-slate-700 border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        {cantinaFilters.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {orders.length === 0 ? (
                    <div className="p-10 text-center bg-white shadow-sm rounded-xl">
                        <FiInbox size={50} className="mx-auto mb-4 text-slate-400" />
                        <h3 className="text-xl font-bold text-slate-700">Nenhum pedido encontrado</h3>
                        <p className="text-slate-500">Não há pedidos que correspondam ao filtro {statusFilter} no momento.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'>
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={updateOrderStatus}
                                onDelete={deleteOrder}
                                isAdmin={userData?.role === 'admin'}
                                deletingOrderId={deletingOrderId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default withAuth(['seller', 'admin'])(SellerOrdersPage);