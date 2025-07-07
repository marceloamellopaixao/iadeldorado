import { Order, OrderStatus } from "@/types/order";
import { format } from 'date-fns';
import { FiClock, FiPhone, FiDollarSign, FiLoader, FiCheck, FiX, FiTruck, FiPlay, FiSend, FiAlertCircle } from 'react-icons/fi';
import { createWhatsAppMessage } from '@/utils/whatsapp';
import { useState } from "react";
import { toast } from "react-toastify";

interface OrderCardProps {
    order: Order;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    onDelete: (orderId: string) => Promise<void>;
    isAdmin: boolean;
    deletingOrderId: string | null;
}

const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
        case 'pendente': return 'bg-yellow-100 text-yellow-800';
        case 'preparando': return 'bg-sky-100 text-sky-800';
        case 'pagamento pendente': return 'bg-orange-100 text-orange-800';
        case 'pago': return 'bg-green-100 text-green-800';
        case 'não pago': return 'bg-rose-100 text-rose-800';
        case 'concluido': return 'bg-blue-100 text-blue-800';
        case 'entregue': return 'bg-slate-200 text-slate-800';
        case 'cancelado': return 'bg-rose-100 text-rose-800';
        default: return 'bg-slate-100 text-slate-700';
    }
};

export default function OrderCard({ order, onUpdateStatus, onDelete, isAdmin, deletingOrderId }: OrderCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const getStatusOptions = (currentStatus: OrderStatus) => {
        const options: { value: OrderStatus; label: string; icon: React.ReactNode, color: string; }[] = [];
        switch (currentStatus) {
            case 'pendente':
                options.push({ value: 'preparando', label: 'Preparar', icon: <FiPlay/>, color: 'bg-yellow-500 hover:bg-yellow-600' });
                break;
            case 'preparando':
                options.push({ value: 'concluido', label: 'Concluir', icon: <FiCheck/>, color: 'bg-blue-500 hover:bg-blue-600' });
                options.push({ value: 'pagamento pendente', label: 'Aguardar Pag.', icon: <FiClock/>, color: 'bg-orange-500 hover:bg-orange-600' });
                break;
            case 'pagamento pendente':
                options.push({ value: 'pago', label: 'Pago', icon: <FiDollarSign/>, color: 'bg-green-500 hover:bg-green-600' });
                options.push({ value: 'não pago', label: 'Não Pago', icon: <FiAlertCircle/>, color: 'bg-slate-500 hover:bg-slate-600' });
                break;
            case 'não pago':
                options.push({ value: 'pago', label: 'Marcar como Pago', icon: <FiDollarSign/>, color: 'bg-green-500 hover:bg-green-600' });
                break;
            case 'pago':
                options.push({ value: 'não pago', label: 'Não Pago', icon: <FiAlertCircle/>, color: 'bg-slate-500 hover:bg-slate-600' });
                options.push({ value: 'concluido', label: 'Concluir', icon: <FiCheck/>, color: 'bg-blue-500 hover:bg-blue-600' });
                break;
            case 'concluido':
                options.push({ value: 'não pago', label: 'Não Pago', icon: <FiAlertCircle/>, color: 'bg-slate-500 hover:bg-slate-600' });
                options.push({ value: 'entregue', label: 'Entregar', icon: <FiTruck/>, color: 'bg-teal-500 hover:bg-teal-600' });
                break;
        }
        if(currentStatus !== 'cancelado' && currentStatus !== 'entregue') {
             options.push({ value: 'cancelado', label: 'Cancelar', icon: <FiX/>, color: 'bg-rose-500 hover:bg-rose-600' });
        }
        return options;
    };
    
    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        setIsUpdating(true);
        await onUpdateStatus(order.id, newStatus);
        setIsUpdating(false);
    }
    
    const handleSendReceipt = () => {
        if (!order.clientWhatsApp || !/^\d{10,13}$/.test(order.clientWhatsApp)) {
            toast.warn("Este cliente não possui um número de WhatsApp válido cadastrado.");
            return;
        }
        const message = createWhatsAppMessage({
            name: order.clientName,
            items: order.items,
            total: order.total,
            paymentMethod: order.paymentMethod,
            pixDetails: order.selectedPix,
        });
        window.open(`https://api.whatsapp.com/send?phone=55${order.clientWhatsApp}&text=${encodeURIComponent(message)}`, '_blank');
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-md p-5 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                    <p className="text-sm text-slate-500">Pedido <span className="font-bold text-sky-600">#{order.id.slice(0, 5).toUpperCase()}</span></p>
                    <h3 className="text-slate-800 text-lg font-bold">{order.clientName}</h3>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusBadgeStyle(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 border-t border-b border-slate-100 py-3 my-3">
                <div className="flex items-center gap-2"><FiClock size={14}/><span>{format(order.createdAt, "dd/MM/yyyy 'às' HH:mm")}</span></div>
                <div className="flex items-center gap-2"><FiDollarSign size={14}/><span>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</span></div>
                {order.clientWhatsApp && (
                    <div className="flex items-center gap-2">
                        <FiPhone size={14}/>
                        <a onClick={handleSendReceipt} className="hover:underline cursor-pointer text-sky-600 font-medium">Contatar via WhatsApp</a>
                    </div>
                )}
            </div>
            
            <div className="flex-grow">
                <h4 className='text-slate-800 font-semibold text-sm mb-2'>Itens:</h4>
                <ul className='space-y-1 text-sm'>
                    {order.items.map((item) => (
                        <li key={item.id} className='flex justify-between text-slate-700'>
                            <span className='truncate max-w-[70%]'>{item.quantity}x {item.name}</span>
                            <span className='whitespace-nowrap font-medium'>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className='border-t border-slate-100 pt-4 mt-4'>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 font-medium">Total:</span>
                    <span className='text-slate-900 font-bold text-xl'>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="mb-3">
                     <button onClick={handleSendReceipt} className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-green-500 text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors">
                        <FiSend/>
                        <span>Enviar Recibo</span>
                    </button>
                </div>

                <div className='flex gap-2 flex-wrap justify-end'>
                    {isUpdating ? (
                         <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-500 font-bold rounded-lg cursor-wait" disabled>
                            <FiLoader className="animate-spin"/> Atualizando...
                        </button>
                    ) : (
                        getStatusOptions(order.status).map((option) => (
                            <button key={option.value} onClick={() => handleStatusUpdate(option.value)} className={`${option.color} text-white px-3 py-2 rounded-lg text-xs font-bold flex-1 flex items-center justify-center gap-2`}>
                                {option.icon} {option.label}
                            </button>
                        ))
                    )}
                </div>
                
                 {isAdmin && (
                    <div className='mt-3 text-right'>
                        <button onClick={() => onDelete(order.id)} disabled={deletingOrderId === order.id || order.status === 'cancelado'} className='text-xs text-rose-500 hover:underline disabled:opacity-50'>
                            {deletingOrderId === order.id ? 'Excluindo...' : 'Excluir Pedido'}
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
}