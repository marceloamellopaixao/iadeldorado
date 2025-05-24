import { useState, useEffect } from 'react';
import { collection, query, where, updateDoc, doc, onSnapshot, orderBy, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus } from '@/types/order';
import { createWhatsAppMessage } from '@/utils/whatsapp';
import { withAuth } from '@/hooks/withAuth'
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { useDropdownClose } from '@/hooks/useDropdownClose';
import Head from 'next/head';

function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos');
    const { dropdownStates, setDropdownRef, toggleDropdown } = useDropdownClose();


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

    // Atualiza o estado dos pedidos
    useEffect(() => {
        if (filter === 'todos') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter((order) => order.status === filter));
        }
    }, [filter, orders]);

    // Atualiza o status do pedido
    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const order = orders.find((o) => o.id === orderId);

            if (!order) throw new Error('Pedido não encontrado');

            // Se o pedido for cancelado, devolver itens ao estoque
            if (newStatus === 'cancelado') {
                const updateStockPromises = order.items.map(async (item) => {
                    const productRef = doc(db, 'products', item.id); // supondo que `item.id` é o mesmo do produto
                    await updateDoc(productRef, {
                        stock: increment(item.quantity) // adiciona a quantidade cancelada de volta
                    });
                });

                await Promise.all(updateStockPromises);
            }

            // Atualiza status do pedido
            await updateDoc(orderRef, {
                status: newStatus,
                updatedAt: new Date(),
            });

            // Se for concluído, enviar mensagem pelo WhatsApp
            if (newStatus === 'concluido') {
                const message = createWhatsAppMessage({
                    name: order.clientName,
                    items: order.items,
                    total: order.total,
                    paymentMethod: order.paymentMethod,
                    pixDetails: order.selectedPix
                });

                window.open(
                    `https://wa.me/+55${order.clientWhatsApp}?text=${encodeURIComponent(message)}`,
                    '_blank'
                );
            }

        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
        }
    };

    // Função para obter as opções de status com base no status atual
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

    // Filtros de status
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
            <Head>
                <title>IAD Eldorado - Pedidos</title>
                <meta name="description" content="Lista de pedidos realizados na IAD Eldorado." />
            </Head>

            {/* Linha com filtros e dropdown */}
            <div className="flex flex-wrap justify-between items-center mb-6">
                <div className='flex flex-row space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
                    {/* Título sempre visível no topo */}
                    <h1 className="text-white text-2xl font-bold">Pedidos</h1>
                    <div className="flex flex-col md:flex-row md:relative">
                        <button
                            onClick={() => toggleDropdown('status')}
                            className="flex flex-row items-center justify-between w-full bg-blue-500 text-white font-bold px-2 py-1 rounded hover:bg-blue-800 transition duration-300 md:w-auto"
                        >
                            <span>{filter.charAt(0).toUpperCase() + filter.substring(1)}</span>
                            <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform ${dropdownStates.status ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                            </svg>
                        </button>

                        {/* Dropdown */}
                        <div ref={(el) => setDropdownRef('status', el)} className={`${dropdownStates.status ? 'block' : 'hidden'} w-full md:mt-12 md:absolute md:z-10 md:bg-blue-500 md:divide-y md:divide-gray-100 md:rounded-lg md:shadow md:w-44`}>
                            <ul className="flex flex-col items-center space-y-2 bg-blue-500 rounded md:py-2 md:text-sm">
                                {statusFilters.map((status) => (
                                    <li key={status} className='w-full'>
                                        <button
                                            onClick={() => setFilter(status)}
                                            className={`px-3 py-2 w-full text-xs sm:text-sm
                                        ${filter === status
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-black'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
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
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {filteredOrders.map((order) => {

                        const prefixo = `(${order.clientWhatsApp.substring(0, 2)})`;
                        const corpo = order.clientWhatsApp.substring(2, 7);
                        const final = order.clientWhatsApp.substring(7, 11);
                        const numeroFormatado = `${prefixo} ${corpo}-${final}`;

                        return (
                            <div
                                key={order.id}
                                className='bg-gray-800 border border-zinc-400 rounded-xl shadow-lg p-4 flex flex-col justify-between h-full transition hover:shadow-xl hover:scale-105 duration-300 ease-linear'
                            >
                                <div className='flex justify-between items-start gap-4'>
                                    <div className='flex-1'>
                                        <h3 className='text-white font-bold text-sm sm:text-base'>
                                            #{order.id?.slice(0, 5).toUpperCase()} - {order.clientName.charAt(0).toUpperCase() + order.clientName.slice(1)}
                                        </h3>
                                        <p className='text-white text-xs sm:text-sm'>Tel: {numeroFormatado}</p>
                                        <p className='text-white text-xs sm:text-sm'>
                                            Pagamento: <span className='font-medium'>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</span>
                                        </p>
                                        <p className='text-white text-xs sm:text-sm'>Data de Compra: {format(order.createdAt, "dd/MM/yyyy - HH:mm")}</p>
                                    </div>

                                    <span className={`px-2 py-1 rounded-full text-sm font-bold whitespace-nowrap
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
                                    <h4 className='text-white font-semibold text-sm sm:text-base mb-2'>Itens:</h4>
                                    <ul className='space-y-1 text-xs sm:text-sm'>
                                        {order.items.map((item) => (
                                            <li key={item.id} className='flex justify-between'>
                                                <span className='text-white truncate max-w-[70%]'>{item.quantity}x {item.name}</span>
                                                <span className='text-white whitespace-nowrap'>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className='border-t pt-3 flex justify-between items-center'>
                                    <p className='text-white font-bold text-sm sm:text-base'>Total: R$ {order.total}</p>
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
                        )
                    })}
                </div>
            )}
        </div>
    );
}

export default withAuth(['seller', 'admin'])(SellerOrdersPage);