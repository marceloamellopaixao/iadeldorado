import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { FiAtSign, FiCalendar, FiClipboard, FiDollarSign, FiInbox, FiPackage } from "react-icons/fi";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { withAuth } from "@/hooks/withAuth";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import { calculateCartItemTotal } from "@/utils/pricing";

interface ProductReport {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

function ReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [productsReport, setProductsReport] = useState<ProductReport[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateContainerClick = () => dateInputRef.current?.showPicker();

  const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);

    const startOfDay = new Date(`${selectedDate}T00:00:00`);
    const endOfDay = new Date(`${selectedDate}T23:59:59`);

    const reportQuery = query(
      collection(db, "orders"),
      where("status", "in", ["preparando", "concluido", "entregue", "pagamento pendente", "pago"]),
      where("createdAt", ">=", startOfDay),
      where("createdAt", "<=", endOfDay),
    );

    const unsubscribe = onSnapshot(reportQuery, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate(),
      })) as Order[];

      setOrders(ordersData);

      const productMap: { [id: string]: ProductReport } = {};
      let total = 0;
      ordersData.forEach((order) => {
        order.items.forEach((item) => {
          if (!productMap[item.id]) {
            productMap[item.id] = { id: item.id, name: item.name, quantity: 0, total: 0 };
          }
          productMap[item.id].quantity += item.quantity;
          const itemTotal = calculateCartItemTotal(item);
          productMap[item.id].total += itemTotal;
          total += itemTotal;
        });
      });

      setProductsReport(Object.values(productMap).sort((a, b) => b.quantity - a.quantity));
      setTotalValue(total);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const cantinasDoDia = Array.from(new Set(orders.map((o) => o.cantinaId))).join(", ") || "Nenhuma";

  if (loading) {
    return <LoadingSpinner message="Gerando relatorio..." />;
  }

  return (
    <>
      <Head>
        <title>Relatorio Diario de Vendas | IAD Eldorado</title>
        <meta name="description" content="Relatorio de vendas por dia." />
      </Head>
      <div className="container mx-auto p-4 md:p-8">
        <header className="cantina-panel mb-8 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="cantina-title text-3xl font-bold">Relatorio Diario</h1>
            <p className="cantina-subtitle mt-1 text-sm">Visualize o resumo das vendas do dia selecionado.</p>
          </div>
          <div
            onClick={handleDateContainerClick}
            className="group relative flex cursor-pointer items-center gap-x-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 transition-colors hover:border-sky-500"
          >
            <FiCalendar className="text-slate-500 transition-colors group-hover:text-sky-500" />
            <span className="font-bold text-slate-700">{displayDate}</span>
            <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="sr-only" />
          </div>
        </header>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="cantina-panel flex items-center p-6">
              <div className="mr-4 rounded-full bg-sky-100 p-3">
                <FiPackage className="text-2xl text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-500">Total de Pedidos</h2>
                <p className="text-3xl font-bold text-slate-800">{orders.length}</p>
              </div>
            </div>
            <div className="cantina-panel flex items-center p-6">
              <div className="mr-4 rounded-full bg-sky-100 p-3">
                <FiDollarSign className="text-2xl text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-500">Valor Total Vendido</h2>
                <p className="text-3xl font-bold text-slate-800">R$ {totalValue.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
            <div className="cantina-panel flex items-center p-6">
              <div className="mr-4 rounded-full bg-sky-100 p-3">
                <FiAtSign className="text-2xl text-sky-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-slate-500">Cantina do Dia</h2>
                <p className="text-lg font-bold text-slate-800">{cantinasDoDia}</p>
              </div>
            </div>
          </div>

          <div className="cantina-panel p-4 sm:p-6">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-800">
              <FiClipboard className="mr-3 text-slate-500" />
              Produtos Vendidos
            </h2>
            {productsReport.length === 0 ? (
              <div className="py-10 text-center text-slate-500">
                <FiInbox size={40} className="mx-auto mb-2 text-slate-400" />
                <p>Nenhum produto foi vendido neste dia.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Produto</th>
                      <th className="px-4 py-3 text-center font-semibold">Quantidade</th>
                      <th className="px-4 py-3 text-right font-semibold">Valor Arrecadado</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-800">
                    {productsReport.map((prod) => (
                      <tr key={prod.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{prod.name}</td>
                        <td className="px-4 py-3 text-center">{prod.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium">R$ {prod.total.toFixed(2).replace(".", ",")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(["seller", "admin"])(ReportPage);
