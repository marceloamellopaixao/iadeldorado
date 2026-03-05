import { useEffect, useState } from "react";
import Head from "next/head";
import { collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, QueryConstraint, Timestamp, updateDoc, where } from "firebase/firestore";
import { FiInbox } from "react-icons/fi";
import { toast } from "react-toastify";
import OrderCard from "@/components/seller/OrderCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/hooks/withAuth";
import { db } from "@/lib/firebase";
import { CartItem, Order, OrderStatus } from "@/types/order";
import { calculateCartItemTotal } from "@/utils/pricing";

function SellerOrdersPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">("todos");
  const [cantinaFilter, setCantinaFilter] = useState<string | "todas">("todas");
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const baseQuery = collection(db, "orders");
    const queryConstraints: QueryConstraint[] = [];

    if (statusFilter === "todos") {
      queryConstraints.push(where("status", "not-in", ["entregue", "cancelado", "nÃ£o pago"]));
    } else {
      queryConstraints.push(where("status", "==", statusFilter));
    }

    if (cantinaFilter !== "todas") {
      queryConstraints.push(where("cantinaId", "==", cantinaFilter));
    }

    if (statusFilter === "todos") {
      queryConstraints.push(orderBy("status"));
    }
    queryConstraints.push(orderBy("createdAt", "desc"));

    const ordersQuery = query(baseQuery, ...queryConstraints);

    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
          total: data.items.reduce((sum: number, item: CartItem) => sum + calculateCartItemTotal(item), 0),
        } as Order;
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, cantinaFilter]);

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Tem certeza? Esta acao devolvera os itens ao estoque e removera o pedido.")) return;
    setDeletingOrderId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      const order = orders.find((o) => o.id === orderId);
      if (!order) throw new Error("Pedido nao encontrado");

      const stockUpdatePromises = order.items.map((item) => updateDoc(doc(db, "products", item.id), { stock: increment(item.quantity) }));
      await Promise.all(stockUpdatePromises);
      await deleteDoc(orderRef);
      toast.success(`Pedido #${orderId.slice(0, 5)} excluido com sucesso.`);
    } catch {
      toast.error("Erro ao excluir o pedido.");
    } finally {
      setDeletingOrderId(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const order = orders.find((o) => o.id === orderId);
      if (!order) throw new Error("Pedido nao encontrado");

      if (newStatus === "cancelado") {
        const stockUpdatePromises = order.items.map((item) => updateDoc(doc(db, "products", item.id), { stock: increment(item.quantity) }));
        await Promise.all(stockUpdatePromises);
      }

      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      toast.info(`Status do pedido #${orderId.slice(0, 5)} atualizado para "${newStatus}".`);
    } catch {
      toast.error("Erro ao atualizar o status do pedido.");
    }
  };

  const statusFilters: { label: string; value: OrderStatus | "todos" }[] = [
    { label: "Ativos", value: "todos" },
    { label: "Pendentes", value: "pendente" },
    { label: "Preparando", value: "preparando" },
    { label: "Pag. Pendente", value: "pagamento pendente" },
    { label: "Pago", value: "pago" },
    { label: "Nao Pago", value: "nÃ£o pago" },
    { label: "Concluido", value: "concluido" },
    { label: "Entregue", value: "entregue" },
    { label: "Cancelado", value: "cancelado" },
  ];

  const cantinaFilters: { label: string; value: string }[] = [
    { label: "Todas", value: "todas" },
    { label: "Criancas", value: "criancas" },
    { label: "Jovens", value: "jovens" },
    { label: "Irmas", value: "irmas" },
    { label: "Missoes", value: "missoes" },
  ];

  if (loading) {
    return <LoadingSpinner message="Carregando pedidos..." />;
  }

  return (
    <>
      <Head>
        <title>Gerenciar Pedidos | IAD Eldorado</title>
        <meta name="description" content="Acompanhe e gerencie os pedidos da cantina." />
      </Head>
      <div className="container mx-auto p-4 md:p-8">
        <div className="cantina-panel mb-8 p-5">
          <h1 className="cantina-title text-3xl font-bold">Gerenciar Pedidos</h1>
          <p className="cantina-subtitle mt-1 text-sm">Acompanhe e atualize o status dos pedidos em tempo real.</p>
        </div>

        <div className="mb-6 rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
            {statusFilters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  statusFilter === value ? "bg-sky-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 font-semibold text-slate-600">Cantina:</span>
            <select
              value={cantinaFilter}
              onChange={(e) => setCantinaFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {cantinaFilters.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="cantina-panel p-10 text-center">
            <FiInbox size={50} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-700">Nenhum pedido encontrado</h3>
            <p className="text-slate-500">Nao ha pedidos para o filtro selecionado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                onDelete={deleteOrder}
                isAdmin={userData?.role === "admin"}
                deletingOrderId={deletingOrderId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(["seller", "admin"])(SellerOrdersPage);
