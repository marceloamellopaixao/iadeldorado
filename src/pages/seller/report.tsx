import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Head from 'next/head';
import { FiCalendar, FiDollarSign, FiPackage, FiClipboard, FiInbox, FiAtSign } from 'react-icons/fi';

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

    const handleDateContainerClick = () => {
        dateInputRef.current?.showPicker();
    };

    const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    useEffect(() => {
        if (!selectedDate) return;
        setLoading(true);

        const startOfDay = new Date(selectedDate + 'T00:00:00');
        const endOfDay = new Date(selectedDate + 'T23:59:59');

        const q = query(
            collection(db, 'orders'),
            where('status', 'in', ['preparando', 'concluido', 'entregue', 'pagamento pendente', 'pago']),
            where('createdAt', '>=', startOfDay),
            where('createdAt', '<=', endOfDay)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as Timestamp).toDate(),
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
                    const itemTotal = item.price * item.quantity;
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

    const cantinasDoDia = Array.from(new Set(orders.map(o => o.cantinaId)));

    if (loading) {
        return <LoadingSpinner message="Gerando relatório..." />;
    }

    return (
        <>
            <Head>
                <title>Relatório Diário de Vendas | IAD Eldorado</title>
                <meta name="description" content="Relatório de vendas por dia." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Relatório Diário</h1>
                        <p className="text-slate-500 mt-1">Visualize o resumo das vendas do dia selecionado.</p>
                    </div>
                    <div onClick={handleDateContainerClick} className="group relative flex cursor-pointer items-center gap-x-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 transition-colors hover:border-sky-500">
                        <FiCalendar className="text-slate-500 transition-colors group-hover:text-sky-500" />
                        <span className="font-bold text-slate-700">{displayDate}</span>
                        <input ref={dateInputRef} type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="sr-only" />
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center shadow-sm">
                            <div className="bg-sky-100 p-3 rounded-full mr-4">
                                <FiPackage className="text-sky-600 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-slate-500">Total de Pedidos</h2>
                                <p className="text-3xl font-bold text-slate-800">{orders.length}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center shadow-sm">
                            <div className="bg-green-100 p-3 rounded-full mr-4">
                                <FiDollarSign className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-slate-500">Valor Total Vendido</h2>
                                <p className="text-3xl font-bold text-slate-800">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center shadow-sm">
                            <div className="bg-purple-100 p-3 rounded-full mr-4">
                                <FiAtSign className="text-purple-600 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-slate-500">Cantina do Dia</h2>
                                <p className="text-3xl font-bold text-slate-800">{cantinasDoDia}</p>
                            </div>
                        </div>
                        
                    </div>

                    {/* Tabela de Produtos Vendidos */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <FiClipboard className="mr-3 text-slate-500" />
                            Produtos Vendidos
                        </h2>
                        {productsReport.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                <FiInbox size={40} className="mx-auto text-slate-400 mb-2"/>
                                <p>Nenhum produto foi vendido neste dia.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Produto</th>
                                            <th className="px-4 py-3 font-semibold text-center">Quantidade</th>
                                            <th className="px-4 py-3 font-semibold text-right">Valor Arrecadado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-800">
                                        {productsReport.map((prod) => (
                                            <tr key={prod.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium">{prod.name}</td>
                                                <td className="px-4 py-3 text-center">{prod.quantity}</td>
                                                <td className="px-4 py-3 text-right font-medium">R$ {prod.total.toFixed(2).replace('.', ',')}</td>
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

export default withAuth(['seller', 'admin'])(ReportPage);