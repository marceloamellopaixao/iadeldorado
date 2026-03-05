import { deleteDoc, doc } from "firebase/firestore";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsAdmin } from "@/hooks/useProductsAdmin";
import { db } from "@/lib/firebase";
import {
    deleteProductFromSupabaseTable,
    deleteProductImage,
    deleteProductStorageFolder,
} from "@/lib/supabaseProducts";
import { Product } from "@/types/product";
import { getTierBadgeText } from "@/utils/pricing";

type StatusFilterType = "ativos" | "inativos" | "todos";

interface ProductTableProps {
    onEdit: (product: Product) => void;
    status: StatusFilterType;
}

export default function ProductTable({ onEdit, status }: ProductTableProps) {
    const { userData } = useAuth();
    const { products, loading } = useProductsAdmin();

    const handleDelete = async (product: Product) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            try {
                await deleteProductImage(product.imagePath, product.imageUrl);
            } catch (storageError) {
                console.warn("Falha ao remover imagem no Supabase Storage:", storageError);
            }
            try {
                await deleteProductStorageFolder(product.id);
            } catch (folderError) {
                console.warn("Falha ao remover pasta de arquivos do produto no Supabase Storage:", folderError);
            }
            try {
                await deleteProductFromSupabaseTable(product.id);
            } catch (tableError) {
                console.warn("Falha ao remover produto na tabela do Supabase:", tableError);
            }
            await deleteDoc(doc(db, "products", product.id));
            toast.success("Produto excluido com sucesso!");
        } catch {
            toast.error("Nao foi possivel excluir o produto.");
        }
    };

    const filteredProducts = products.filter((product) => {
        if (status === "todos") return true;
        if (status === "ativos") return product.status === true;
        if (status === "inativos") return product.status === false;
        return true;
    });

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    if (products.length > 0 && filteredProducts.length === 0) {
        return <div className="cantina-panel p-8 text-center text-slate-500">Nenhum produto encontrado com o filtro selecionado.</div>;
    }

    if (filteredProducts.length === 0) {
        return (
            <div className="cantina-panel p-8 text-center text-slate-500">
                <p>Nenhum produto cadastrado ainda.</p>
                <p className="mt-2 text-sm">Use o formulario ao lado para adicionar o primeiro produto.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProducts.map((product) => (
                <article key={product.id} className="flex h-full flex-col justify-between rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-5 shadow-sm">
                    <div className="flex-grow">
                        <div className="relative mb-4 h-28 overflow-hidden rounded-xl border border-[#e7d8be] bg-[#f8f2e6]">
                            {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs font-bold tracking-[0.12em] text-[#8b5e34]">SEM FOTO</div>
                            )}
                        </div>

                        <div className="mb-2 flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${product.status ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-800"}`}>
                                {product.status ? "Ativo" : "Inativo"}
                            </span>
                        </div>
                        <p className="mb-4 min-h-[40px] text-sm text-slate-600">{product.description || "Sem descricao."}</p>
                        {(product.pricingTiers || []).length > 0 && (
                            <p className="mb-3 text-xs font-bold text-[#8b5e34]">
                                Oferta: {(product.pricingTiers || []).map(getTierBadgeText).join(" | ")}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="mb-5 flex items-baseline justify-between">
                            <p className="text-xl font-black text-slate-900">R$ {product.price.toFixed(2).replace(".", ",")}</p>
                            <p className={`text-sm font-semibold ${product.stock <= 0 ? "text-rose-500" : "text-slate-600"}`}>Estoque: {product.stock}</p>
                        </div>

                        <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 pt-4">
                            <button onClick={() => onEdit(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-500" title="Editar Produto">
                                <FiEdit size={16} />
                                <span>Editar</span>
                            </button>
                            {userData?.role === "admin" && (
                                <button onClick={() => handleDelete(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-500" title="Excluir Produto">
                                    <FiTrash2 size={16} />
                                    <span>Excluir</span>
                                </button>
                            )}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
