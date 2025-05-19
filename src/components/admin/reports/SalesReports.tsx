import { useState, useEffect } from "react";
import { useReports } from "@/hooks/useReports";
import { format } from "date-fns";
import SalesChart from "./SalesChart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { useCart } from "@/hooks/useCart";

export default function SalesReport() {
    const { total } = useCart();

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date()
    })
    const { salesData, loading, fetchSalesData } = useReports();

    useEffect(() => {
        fetchSalesData(dateRange.start, dateRange.end);
    }, [dateRange, fetchSalesData]);

    return (
        <div className="container mx-auto p-4 max-w-2xl rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Relatório de Vendas</h2>

            <div className="flex gap-4 mb-6 items-center">
                <input
                    type="date"
                    value={format(dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                    className="p-2 border rounded"
                />
                <span>até</span>
                <input
                    type="date"
                    value={format(dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                    className="p-2 border rounded"
                />
            </div>

            {loading ? (
                <LoadingSpinner message="Carregando relatório..." />
            ) : salesData.length === 0 ? (
                <EmptyState message="Nenhum dado encontrado para o período selecionado." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left text-black">Data</th>
                                <th className="px-4 py-2 text-left text-black">Cliente</th>
                                <th className="px-4 py-2 text-left text-black">Total</th>
                                <th className="px-4 py-2 text-left text-black">Pagamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((order) => (
                                <tr key={order.id}>
                                    <td className="border px-4 py-2 text-black">{format(order.createdAt, 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="border px-4 py-2 text-black">{order.clientName}</td>
                                    <td className="border px-4 py-2 text-black">R$ {total.toFixed(2).replace('.', ',')}</td>
                                    <td className="border px-4 py-2 text-black">{order.paymentMethod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <SalesChart orders={salesData} dateRange={dateRange} />
        </div>
    );
}