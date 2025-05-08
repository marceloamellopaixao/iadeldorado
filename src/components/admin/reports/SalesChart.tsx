// src/components/admin/reports/SalesChart.tsx
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format, eachDayOfInterval } from 'date-fns';
import { Order } from '@/types/order';

Chart.register(...registerables);

interface SalesChartProps {
    orders: Order[];
    dateRange: {
        start: Date;
        end: Date;
    };
}

export default function SalesChart({ orders, dateRange }: SalesChartProps) {
    // Agrupa vendas por dia
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });

    const data = {
        labels: days.map(day => format(day, 'dd/MM')),
        datasets: [{
            label: 'Vendas (R$)',
            data: days.map(day =>
                orders
                    .filter(order => format(order.createdAt, 'dd/MM/yyyy') === format(day, 'dd/MM/yyyy'))
                    .reduce((sum, order) => sum + order.total, 0)
            ),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
        }]
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-6">
            <h3 className="font-medium mb-4 text-black">Vendas por Período</h3>
            <Line data={data} />
        </div>
    );
}