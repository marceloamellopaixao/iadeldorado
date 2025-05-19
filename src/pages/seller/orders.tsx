import { useState, useEffect } from 'react';
import { collection, query, where, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartItem, Order, OrderStatus } from '@/types/order';
import { createWhatsAppMessage } from '@/utils/whatsapp';
import { withAuth } from '@/hooks/withAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';

function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos');

    // Busca pedidos com filtro e em tempo real
    useEffect(() => {
        let unsubscribe: () => void;

        const fetchOrders = async () => {
            try {
                let q;
                if (filter === 'todos') {
                    q = query(
                        collection(db, 'orders'),
                        where('status', 'not-in', ['entregue', 'cancelado', 'pago']),
                        orderBy('createdAt', 'desc')
                    );
                } else {
                    q = query(
                        collection(db, 'orders'),
                        where('status', '==', filter),
                        orderBy('createdAt', 'desc')
                    )
                }

                unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const ordersData = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                        createdAt: doc.data().createdAt.toDate(),
                        updatedAt: doc.data().updatedAt?.toDate(),
                        total: doc.data().items.reduce((sum: number, item: { price: number; quantity: number; }) => sum + (item.price * item.quantity), 0)
                            .toFixed(2)
                            .replace('.', ','),
                    })) as Order[];
                    setOrders(ordersData);
                    setFilteredOrders(ordersData);
                });

            } catch {
                return;
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [filter]);

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const order = orders.find((o) => o.id === orderId);

            if (!order) {
                throw new Error('Pedido não encontrado');
            };

            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date(),
            });

            if (newStatus === 'concluido') {
                const message = createWhatsAppMessage({
                    name: order.clientName,
                    items: order.items,
                    total: parseFloat(order.total.toFixed(2).replace('.', ',')),
                    paymentMethod: order.paymentMethod,
                    pixDetails: order.selectedPix
                });

                window.open(
                    `https://wa.me/+55${order.clientWhatsApp}?text=${encodeURIComponent(message)}`,
                    '_blank'
                );
            }
        } catch {
            return;
        }
    };

    const getStatusOptions = (currentStatus: OrderStatus) => {
        const options: {
            value: OrderStatus;
            label: string;
            color: string;
        }[] = [];

        switch (currentStatus) {
            case 'pendente':
                options.push(
                    { value: 'preparando', label: 'Preparar', color: 'bg-yellow-500 hover:bg-yellow-600' },
                    { value: 'cancelado', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600' }
                );
                break;
            case 'preparando':
                options.push(
                    { value: 'concluido', label: 'Concluir', color: 'bg-green-500 hover:bg-green-600' },
                    { value: 'pagamento pendente', label: 'Pagamento Pendente', color: 'bg-orange-500 hover:bg-orange-600' },
                    { value: 'cancelado', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600' }
                );
                break;
            case 'pagamento pendente':
                options.push(
                    { value: 'pago', label: 'Marcar como Pago', color: 'bg-blue-500 hover:bg-blue-600' },
                    { value: 'não pago', label: 'Marcar como Não Pago', color: 'bg-gray-500 hover:bg-gray-600' }
                );
                break;
            case 'pago':
                options.push(
                    { value: 'concluido', label: 'Concluir', color: 'bg-green-500 hover:bg-green-600' },
                    { value: 'cancelado', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600' }
                );
                break;
            case 'não pago':
                options.push(
                    { value: 'pago', label: 'Marcar como Pago', color: 'bg-blue-500 hover:bg-blue-600' },
                    { value: 'cancelado', label: 'Cancelar', color: 'bg-red-500 hover:bg-red-600' }
                );
                break;
            case 'concluido':
                options.push(
                    { value: 'entregue', label: 'Marcar como Entregue', color: 'bg-purple-500 hover:bg-purple-600' }
                );
                break;
        }

        return options;
    };

    const statusFilters: Array<OrderStatus | 'todos'> = [
        'todos',
        'pendente',
        'preparando',
        'pagamento pendente',
        'pago',
        'não pago',
        'concluido',
        'entregue',
        'cancelado'
    ]

    if (loading) {
        return <LoadingSpinner message='Carregando pedidos...' />
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

                <div className='flex space-x-2'>
                    {statusFilters.map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs sm:text-sm 
                                ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    Nenhum pedido encontrado.
                    <button
                        onClick={() => setFilter('todos')}
                        className="absolute top-1 right-1 font-bold text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filteredOrders.map((order) => (
                        <div
                            key={order.id}
                            className='border p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300'
                        >
                            <div className='flex justify-between items-start gap-4'>
                                <div className='flex-1'>
                                    <h3 className='font-bold text-sm sm:text-base'>
                                        #{order.id?.slice(0, 5).toUpperCase()} - {order.clientName.charAt(0).toUpperCase() + order.clientName.slice(1)}
                                    </h3>
                                    <p className='text-xs sm:text-sm'>Tel: {order.clientWhatsApp}</p> {/* Tentar tratar o numero para ficar da seguinte forma (11) 91234-1234 */}
                                    <p className='text-xs sm:text-sm'>
                                        Pagamento: <span className='font-medium'>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</span>
                                    </p>
                                    <p>Data de Compra: {format(order.createdAt, "dd/MM/yyyy - HH:mm")}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                                        ${order.status === 'pendente' ? 'bg-yellow-200 text-yellow-800' :
                                        order.status === 'preparando' ? 'bg-blue-200 text-blue-800' :
                                            order.status === 'pagamento pendente' ? 'bg-orange-200 text-orange-800' :
                                                order.status === 'pago' ? 'bg-green-200 text-green-800' :
                                                    order.status === 'não pago' ? 'bg-red-200 text-red-800' :
                                                        order.status === 'concluido' ? 'bg-purple-200 text-purple-800' :
                                                            order.status === 'entregue' ? 'bg-gray-200 text-gray-800' :
                                                                order.status === 'cancelado' ? 'bg-red-200 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                    }
                                `}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className='my-3 border-t pt-2'>
                                <h4 className='font-semibold text-sm sm:text-base mb-2'>Itens:</h4>
                                <ul className='space-y-1 text-xs sm:text-sm'>
                                    {order.items.map((item) => (
                                        <li key={item.id} className='flex justify-between'>
                                            <span className='truncate max-w-[70%]'>{item.quantity}x {item.name}</span>
                                            <span className='whitespace-nowrap'>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='border-t pt-3 flex justify-between items-center'>
                                <p className='font-bold text-sm sm:text-base'>Total: R$ {order.total}</p>
                                <div className='flex gap-1 flex-wrap justify-end'>
                                    {getStatusOptions(order.status).map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updateOrderStatus(order.id!, option.value)}
                                            className={`${option.color} text-white px-2 py-1 rounded text-xs whitespace-nowrap`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default withAuth(['seller', 'admin'])(SellerOrdersPage);