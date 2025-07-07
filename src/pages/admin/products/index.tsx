import { useState } from "react";
import { withAuth } from "@/hooks/withAuth";
import { Product } from "@/types/product";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductForm from "@/components/admin/products/ProductForm";
import Head from "next/head";
import { FiPlus } from "react-icons/fi";

function AdminProductsPage() {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

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
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Produtos</h1>
                        <p className="text-slate-500 mt-1">Adicione, edite e visualize os produtos da cantina.</p>
                    </div>
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors"
                    >
                        <FiPlus/>
                        <span>Adicionar Novo</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <ProductTable onEdit={handleEdit} />
                    </div>

                    {/* MODO DESKTOP: Formulário fixo, sem alterações */}
                    <div className="hidden lg:block lg:sticky lg:top-24">
                        <ProductForm
                            product={editingProduct}
                            onClose={() => setEditingProduct(null)}
                            onSuccess={() => setEditingProduct(null)}
                        />
                    </div>

                    {/* MODO MOBILE/TABLET: Modal com a correção de layout */}
                    {isFormVisible && (
                        // A MUDANÇA ESTÁ NESTA LINHA
                        <div 
                            className="lg:hidden fixed inset-0 bg-black/60 z-40 flex items-start justify-center overflow-y-auto p-4 pt-12 sm:pt-20"
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