import { Order, OrderStatus } from "@/types/order";
import { format } from "date-fns";
import {
    FiAlertCircle,
    FiCheck,
    FiClock,
    FiDollarSign,
    FiLoader,
    FiPhone,
    FiPlay,
    FiSend,
    FiTruck,
    FiX,
} from "react-icons/fi";
import { createWhatsAppMessage } from "@/utils/whatsapp";
import { useState } from "react";
import { toast } from "react-toastify";
import { calculateCartItemTotal } from "@/utils/pricing";

interface OrderCardProps {
    order: Order;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    onDelete: (orderId: string) => Promise<void>;
    isAdmin: boolean;
    deletingOrderId: string | null;
}

const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
        case "pendente":
            return "bg-yellow-100 text-yellow-800";
        case "preparando":
            return "bg-sky-100 text-sky-800";
        case "pagamento pendente":
            return "bg-orange-100 text-orange-800";
        case "pago":
            return "bg-green-100 text-green-800";
        case "nÃ£o pago":
            return "bg-rose-100 text-rose-800";
        case "concluido":
            return "bg-blue-100 text-blue-800";
        case "entregue":
            return "bg-slate-200 text-slate-800";
        case "cancelado":
            return "bg-rose-100 text-rose-800";
        default:
            return "bg-slate-100 text-slate-700";
    }
};

export default function OrderCard({ order, onUpdateStatus, onDelete, isAdmin, deletingOrderId }: OrderCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const getStatusOptions = (currentStatus: OrderStatus) => {
        const options: { value: OrderStatus; label: string; icon: React.ReactNode; color: string }[] = [];
        switch (currentStatus) {
            case "pendente":
                options.push({ value: "preparando", label: "Preparar", icon: <FiPlay />, color: "bg-yellow-500 hover:bg-yellow-600" });
                break;
            case "preparando":
                options.push({ value: "concluido", label: "Concluir", icon: <FiCheck />, color: "bg-blue-500 hover:bg-blue-600" });
                options.push({ value: "pagamento pendente", label: "Aguardar Pag.", icon: <FiClock />, color: "bg-orange-500 hover:bg-orange-600" });
                break;
            case "pagamento pendente":
                options.push({ value: "pago", label: "Pago", icon: <FiDollarSign />, color: "bg-green-500 hover:bg-green-600" });
                options.push({ value: "nÃ£o pago", label: "Nao Pago", icon: <FiAlertCircle />, color: "bg-slate-500 hover:bg-slate-600" });
                break;
            case "nÃ£o pago":
                options.push({ value: "pago", label: "Marcar como Pago", icon: <FiDollarSign />, color: "bg-green-500 hover:bg-green-600" });
                break;
            case "pago":
                options.push({ value: "nÃ£o pago", label: "Nao Pago", icon: <FiAlertCircle />, color: "bg-slate-500 hover:bg-slate-600" });
                options.push({ value: "concluido", label: "Concluir", icon: <FiCheck />, color: "bg-blue-500 hover:bg-blue-600" });
                break;
            case "concluido":
                options.push({ value: "nÃ£o pago", label: "Nao Pago", icon: <FiAlertCircle />, color: "bg-slate-500 hover:bg-slate-600" });
                options.push({ value: "entregue", label: "Entregar", icon: <FiTruck />, color: "bg-teal-500 hover:bg-teal-600" });
                break;
        }
        if (currentStatus !== "cancelado" && currentStatus !== "entregue") {
            options.push({ value: "cancelado", label: "Cancelar", icon: <FiX />, color: "bg-rose-500 hover:bg-rose-600" });
        }
        return options;
    };

    const getCantinaName = (cantinaId: string) => {
        switch (cantinaId) {
            case "criancas":
                return "Criancas";
            case "jovens":
                return "Jovens";
            case "irmas":
                return "Irmas";
            case "missoes":
                return "Missoes";
            default:
                return "Cantina";
        }
    };

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        setIsUpdating(true);
        await onUpdateStatus(order.id, newStatus);
        setIsUpdating(false);
    };

    const handleSendReceipt = () => {
        if (!order.clientWhatsApp || !/^\d{10,13}$/.test(order.clientWhatsApp)) {
            toast.warn("Este cliente nao possui um numero de WhatsApp valido cadastrado.");
            return;
        }
        const message = createWhatsAppMessage({
            name: order.clientName,
            items: order.items,
            total: order.total,
            paymentMethod: order.paymentMethod,
            pixDetails: order.selectedPix,
        });
        window.open(`https://api.whatsapp.com/send?phone=55${order.clientWhatsApp}&text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <article className="flex h-full flex-col justify-between rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                    {order.cantinaId && (
                        <p className="text-sm text-slate-500">
                            Cantina: <span className="font-bold text-sky-600">{getCantinaName(order.cantinaId)}</span>
                        </p>
                    )}
                    <p className="text-sm text-slate-500">
                        Pedido <span className="font-bold text-sky-600">#{order.id.slice(0, 5).toUpperCase()}</span>
                    </p>
                    <h3 className="text-lg font-bold text-slate-800">{order.clientName}</h3>
                </div>
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadgeStyle(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </div>

            <div className="my-3 space-y-2 border-y border-slate-200 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><FiClock size={14} /><span>{format(order.createdAt, "dd/MM/yyyy 'as' HH:mm")}</span></div>
                <div className="flex items-center gap-2"><FiDollarSign size={14} /><span>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</span></div>
                {order.clientWhatsApp && (
                    <div className="flex items-center gap-2">
                        <FiPhone size={14} />
                        <a onClick={handleSendReceipt} className="cursor-pointer font-medium text-sky-600 hover:underline">Contatar via WhatsApp</a>
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">Itens:</h4>
                <ul className="space-y-1 text-sm">
                    {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-slate-700">
                            <span className="max-w-[70%] truncate">{item.quantity}x {item.name}</span>
                            <span className="whitespace-nowrap font-medium">R$ {calculateCartItemTotal(item).toFixed(2).replace(".", ",")}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium text-slate-600">Total:</span>
                    <span className="text-xl font-bold text-slate-900">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="mb-3">
                    <button onClick={handleSendReceipt} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-teal-500 px-4 py-2 font-bold text-teal-700 transition-colors hover:bg-teal-50">
                        <FiSend />
                        <span>Enviar Recibo</span>
                    </button>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    {isUpdating ? (
                        <button className="flex w-full cursor-wait items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 py-2 font-bold text-slate-500" disabled>
                            <FiLoader className="animate-spin" /> Atualizando...
                        </button>
                    ) : (
                        getStatusOptions(order.status).map((option) => (
                            <button key={option.value} onClick={() => handleStatusUpdate(option.value)} className={`${option.color} flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white`}>
                                {option.icon} {option.label}
                            </button>
                        ))
                    )}
                </div>

                {isAdmin && (
                    <div className="mt-3 text-right">
                        <button onClick={() => onDelete(order.id)} disabled={deletingOrderId === order.id || order.status === "cancelado"} className="text-xs text-rose-500 hover:underline disabled:opacity-50">
                            {deletingOrderId === order.id ? "Excluindo..." : "Excluir Pedido"}
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
