import { withAuth } from '@/hooks/withAuth';
import SalesReport from '@/components/admin/reports/SalesReports';
import Head from 'next/head';

function ReportsPage() {
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Head>
                <title>IAD Eldorado - Relatórios</title>
                <meta name="description" content="Relatórios de vendas e desempenho da IAD Eldorado." />
            </Head>
            <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
            <SalesReport />
        </div>
    )
}

export default withAuth(['admin'])(ReportsPage)