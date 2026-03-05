import { useEffect, useState } from "react";
import Head from "next/head";
import { FiPlus } from "react-icons/fi";
import ProductForm from "@/components/admin/products/ProductForm";
import ProductTable from "@/components/admin/products/ProductTable";
import { withAuth } from "@/hooks/withAuth";
import { Product } from "@/types/product";

type StatusFilterType = "ativos" | "inativos" | "todos";

function AdminProductsPage() {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>(() => {
        if (typeof window !== "undefined") {
            const savedFilter = localStorage.getItem("productStatusFilter") as StatusFilterType | null;
            return savedFilter || "ativos";
        }
        return "ativos";
    });

    useEffect(() => {
        localStorage.setItem("productStatusFilter", statusFilter);
    }, [statusFilter]);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormVisible(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setTimeout(() => setEditingProduct(null), 300);
    };

    return (
        <>
            <Head>
                <title>Gerenciar Produtos | IAD Eldorado</title>
                <meta name="description" content="Adicione, edite e remova produtos da cantina." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="cantina-panel mb-8 flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="cantina-title text-3xl font-bold">Gerenciar Produtos</h1>
                        <p className="cantina-subtitle mt-1 text-sm">Adicione, edite e visualize os produtos da cantina.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-bold text-white transition-colors hover:bg-sky-500 lg:hidden"
                    >
                        <FiPlus />
                        <span>Adicionar Novo</span>
                    </button>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-xl border border-[#e7d8be] bg-[#fffdf7] p-3">
                        <span className="font-medium text-slate-700">Filtrar:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ProductTable onEdit={handleEdit} status={statusFilter} />
                    </div>

                    <div className="hidden lg:sticky lg:top-24 lg:block">
                        <ProductForm product={editingProduct} onClose={() => setEditingProduct(null)} onSuccess={() => setEditingProduct(null)} />
                    </div>

                    {isFormVisible && (
                        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 lg:hidden sm:pt-20" onClick={handleCloseForm}>
                            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <ProductForm product={editingProduct} onClose={handleCloseForm} onSuccess={handleCloseForm} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth(["admin", "seller"])(AdminProductsPage);
