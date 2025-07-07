import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsAdmin } from "@/hooks/useProductsAdmin";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ProductTableProps {
    onEdit: (product: Product) => void;
}

export default function ProductTable({ onEdit }: ProductTableProps) {
    const { userData } = useAuth();
    const { products, loading } = useProductsAdmin();

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este produto? A ação é irreversível.")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            toast.success("Produto excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir produto:", error);
            toast.error("Não foi possível excluir o produto.");
        }
    };

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">
                <p>Nenhum produto cadastrado ainda.</p>
                <p className="text-sm mt-2">Use o formulário ao lado para adicionar o primeiro produto.</p>
            </div>
        );
    }

    return (
        // Grade responsiva, otimizada para o layout de 2 colunas do admin
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
                <div 
                    key={product.id} 
                    className="bg-white border border-slate-200 rounded-xl shadow-md p-5 flex flex-col justify-between h-full transition-shadow hover:shadow-lg"
                >
                    {/* Corpo do Card */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2 gap-3">
                            <h3 className="text-slate-900 text-lg font-bold">{product.name}</h3>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${product.status ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'}`}>
                                {product.status ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 min-h-[40px]">
                            {product.description || "Sem descrição."}
                        </p>
                    </div>

                    {/* Rodapé do Card */}
                    <div>
                        <div className="flex justify-between items-baseline mb-5">
                            <p className="text-slate-900 font-black text-xl">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                            <p className={`text-sm font-semibold ${product.stock <= 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                                Estoque: {product.stock}
                            </p>
                        </div>

                        {/* Botões de Ação com alto contraste */}
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() => onEdit(product)}
                                className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors"
                                title="Editar Produto"
                            >
                                <FiEdit size={16} />
                                <span>Editar</span>
                            </button>
                            {userData?.role === "admin" && (
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
                                    title="Excluir Produto"
                                >
                                    <FiTrash2 size={16} />
                                    <span>Excluir</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}