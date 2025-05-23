import { useEffect, useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import { Product } from "@/types/product";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductForm from "@/components/admin/products/ProductForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Head from "next/head";

function AdminProductsPage() {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simula um carregamento de dados
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [])

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    return (
        <div className="container mx-auto p-4">
            <Head>
                <title>IAD Eldorado - Gerenciar Produtos</title>
                <meta name="description" content="Gerencie os produtos da IAD Eldorado." />
            </Head>
            <h1 className="text-2xl font-bold mb-6">Gerenciar Produtos</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ProductTable onEdit={setEditingProduct} />
                </div>
                <div className="lg:col-span-1">
                    <ProductForm
                        product={editingProduct}
                        onClear={() => setEditingProduct(null)}
                        onSuccess={() => setEditingProduct(null)}
                    />
                </div>
            </div>
        </div >
    );
}

export default withAuth(['admin'])(AdminProductsPage);