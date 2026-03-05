import { useState } from "react";
import { Order, OrderStatus } from "@/types/order";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiChevronDown, FiHash } from "react-icons/fi";
import { calculateCartItemTotal } from "@/utils/pricing";

const getStatusBadgeStyle = (status: OrderStatus) => {
  switch (status) {
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    case "preparando":
      return "bg-sky-100 text-sky-800";
    case "concluido":
      return "bg-blue-100 text-blue-800";
    case "entregue":
      return "bg-green-100 text-green-800";
    case "cancelado":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function OrderHistoryCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e7d8be] bg-[#fffdf7] shadow-sm transition-shadow hover:shadow-md">
      <div className="flex cursor-pointer items-center justify-between p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <FiHash size={16} className="text-slate-400" />
            <span>Pedido #{order.id.slice(0, 5).toUpperCase()}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 sm:mt-0">
            <FiCalendar size={16} />
            <span>{format(order.createdAt, "dd/MM/yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${getStatusBadgeStyle(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-800">Itens do Pedido:</h4>
              <ul className="space-y-1 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-slate-700">
                    <span className="max-w-[70%] truncate">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="whitespace-nowrap font-medium">
                      R$ {calculateCartItemTotal(item).toFixed(2).replace(".", ",")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 font-bold text-slate-800">
                <span>Total:</span>
                <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
