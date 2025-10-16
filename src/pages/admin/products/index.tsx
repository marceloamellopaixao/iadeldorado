import { useEffect, useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import { Product } from "@/types/product";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductForm from "@/components/admin/products/ProductForm";
import Head from "next/head";
import { FiPlus } from "react-icons/fi";

type StatusFilterType = 'ativos' | 'inativos' | 'todos';

function AdminProductsPage() {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>(() => {
        // Verifica se o localStorage está disponível (evita erros no SSR)
        if (typeof window !== 'undefined') {
            const savedFilter = localStorage.getItem('productStatusFilter') as StatusFilterType | null;
            return savedFilter || 'ativos';
        }

        return 'ativos'; // Valor padrão para o SSR 
    });

    // Salva a preferência do filtro no localStorage sempre que mudar
    useEffect(() => {
        localStorage.setItem('productStatusFilter', statusFilter);
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
        setTimeout(() => {
            setEditingProduct(null);
        }, 300);
    };

    return (
        <>
            <Head>
                <title>Gerenciar Produtos | IAD Eldorado</title>
                <meta name="description" content="Adicione, edite e remova produtos da cantina." />
            </Head>
            <div className="container p-4 mx-auto">
                <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Produtos</h1>
                        <p className="mt-1 text-slate-500">Adicione, edite e visualize os produtos da cantina.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 font-bold text-white transition-colors rounded-lg lg:hidden bg-sky-600 hover:bg-sky-700"
                    >
                        <FiPlus />
                        <span>Adicionar Novo</span>
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">Filtrar:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                            className="px-3 py-2 bg-white border rounded-lg text-slate-700 border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>
                </div>

                <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <ProductTable onEdit={handleEdit} status={statusFilter} />
                    </div>

                    <div className="hidden lg:block lg:sticky lg:top-24">
                        <ProductForm
                            product={editingProduct}
                            onClose={() => setEditingProduct(null)}
                            onSuccess={() => setEditingProduct(null)}
                        />
                    </div>

                    {isFormVisible && (
                        <div
                            className="fixed inset-0 z-40 flex items-start justify-center p-4 pt-12 overflow-y-auto lg:hidden bg-black/60 sm:pt-20"
                            onClick={handleCloseForm}
                        >
                            <div
                                className="w-full max-w-md"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ProductForm
                                    product={editingProduct}
                                    onClose={handleCloseForm}
                                    onSuccess={handleCloseForm}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth(['admin', 'seller'])(AdminProductsPage);