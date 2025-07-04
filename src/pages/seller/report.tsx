import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';
import { withAuth } from '@/hooks/withAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Head from 'next/head';
import { FiCalendar, FiDollarSign, FiPackage, FiClipboard } from 'react-icons/fi';

interface ProductReport {
    id: string;
    name: string;
    quantity: number;
    total: number;
}

function ReportPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });
    const [productsReport, setProductsReport] = useState<ProductReport[]>([]);
    const [totalValue, setTotalValue] = useState<number>(0);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleDateContainerClick = () => {
        dateInputRef.current?.showPicker();
    };

    const displayDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    useEffect(() => {
        if (!selectedDate) return;
        setLoading(true);
        const start = new Date(selectedDate + 'T00:00:00');
        const end = new Date(selectedDate + 'T23:59:59');
        const q = query(
            collection(db, 'orders'),
            where('createdAt', '>=', start),
            where('createdAt', '<=', end)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : new Date(data.createdAt),
                    updatedAt: data.updatedAt?.toDate(),
                } as Order;
            });
            setOrders(ordersData);
            const productMap: { [id: string]: ProductReport } = {};
            let total = 0;
            ordersData.forEach((order) => {
                order.items.forEach((item) => {
                    if (!productMap[item.id]) {
                        productMap[item.id] = {
                            id: item.id,
                            name: item.name,
                            quantity: 0,
                            total: 0,
                        };
                    }
                    productMap[item.id].quantity += item.quantity;
                    productMap[item.id].total += item.price * item.quantity;
                    total += item.price * item.quantity;
                });
            });
            setProductsReport(Object.values(productMap));
            setTotalValue(total);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [selectedDate]);

    const getCantinaName = (id: string) => {
        switch (id) {
            case 'criancas': return 'Cantina das Crianças';
            case 'jovens': return 'Cantina dos Jovens';
            case 'irmas': return 'Cantina das Irmãs';
            case 'missoes': return 'Cantina das Missões';
            default: return id || 'Não informado';
        }
    };

    const cantinasDoDia = Array.from(new Set(orders.map(o => o.cantinaId)));
    const formattedTotalValue = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;

    return (
        <div className="bg-slate-900 min-h-screen text-slate-300">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Head>
                    <title>Relatório de Pedidos</title>
                    <meta name="description" content="Relatório de vendas por dia." />
                </Head>

                <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-4 sm:mb-0">
                        Relatório Diário
                    </h1>

                    <div
                        onClick={handleDateContainerClick}
                        className="group relative flex cursor-pointer items-center gap-x-3 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 transition-colors hover:border-blue-500"
                    >
                        <FiCalendar className="text-slate-400 transition-colors group-hover:text-blue-400" />
                        <span className="font-semibold text-white">{displayDate}</span>

                        <input
                            ref={dateInputRef}
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="sr-only"
                        />
                    </div>
                </header>

                {loading ? (
                    <LoadingSpinner message="Gerando relatório..." />
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center">
                                <div className="bg-blue-500/10 p-3 rounded-full mr-4">
                                    <FiPackage className="text-blue-400 text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-medium text-slate-400">Total de Pedidos</h2>
                                    <p className="text-3xl font-bold text-white">{orders.length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center">
                                <div className="bg-green-500/10 p-3 rounded-full mr-4">
                                    <FiDollarSign className="text-green-400 text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-medium text-slate-400">Valor Total Vendido</h2>
                                    <p className="text-3xl font-bold text-white">{formattedTotalValue}</p>
                                </div>
                            </div>
                        </div>

                        {cantinasDoDia.length > 0 && (
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                <h3 className="font-semibold text-white mb-3">Cantina(s) em atividade no dia:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {cantinasDoDia.map(cid => (
                                        <span key={cid} className="text-sky-300 bg-sky-500/20 rounded-full px-3 py-1 text-sm font-medium">
                                            {getCantinaName(cid)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                                <FiClipboard className="mr-3" />
                                Produtos Vendidos
                            </h2>
                            {productsReport.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">Nenhum produto foi vendido neste dia.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm">
                                        <thead className="border-b border-slate-700 text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Produto</th>
                                                <th className="px-4 py-3 font-medium text-center">Quantidade</th>
                                                <th className="px-4 py-3 font-medium text-right">Valor Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white">
                                            {productsReport.map((prod) => (
                                                <tr key={prod.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                                                    <td className="px-4 py-3 font-medium">{prod.name}</td>
                                                    <td className="px-4 py-3 text-center">{prod.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-mono">R$ {prod.total.toFixed(2).replace('.', ',')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default withAuth(['seller', 'admin'])(ReportPage);