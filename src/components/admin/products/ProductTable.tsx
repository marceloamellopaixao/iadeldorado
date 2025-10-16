import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsAdmin } from "@/hooks/useProductsAdmin";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type StatusFilterType = 'ativos' | 'inativos' | 'todos';

interface ProductTableProps {
    onEdit: (product: Product) => void;
    status: StatusFilterType;
}


export default function ProductTable({ onEdit, status }: ProductTableProps) {
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

    const filteredProducts = products.filter(product => {
        if (status === 'todos') return true;
        if (status === 'ativos') return product.status === true;
        if (status === 'inativos') return product.status === false;
        return true;
    })

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    // Mensagem para quando não há produtos após filtrar
    if (products.length > 0 && filteredProducts.length === 0) {
        return (
            <div className="p-8 text-center bg-white shadow-md rounded-xl text-slate-500">
                <p>Nenhum produto encontrado com o filtro selecionado.</p>
            </div>
        );
    }

    if (filteredProducts.length === 0) {
        return (
            <div className="p-8 text-center bg-white shadow-md rounded-xl text-slate-500">
                <p>Nenhum produto cadastrado ainda.</p>
                <p className="mt-2 text-sm">Use o formulário ao lado para adicionar o primeiro produto.</p>
            </div>
        );
    }

    return (
        // Grade responsiva, otimizada para o layout de 2 colunas do admin
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProducts.map((product) => (
                <div
                    key={product.id}
                    className="flex flex-col justify-between h-full p-5 transition-shadow bg-white border shadow-md border-slate-200 rounded-xl hover:shadow-lg"
                >
                    {/* Corpo do Card */}
                    <div className="flex-grow">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
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
                        <div className="flex items-baseline justify-between mb-5">
                            <p className="text-xl font-black text-slate-900">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                            <p className={`text-sm font-semibold ${product.stock <= 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                                Estoque: {product.stock}
                            </p>
                        </div>

                        {/* Botões de Ação com alto contraste */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => onEdit(product)}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-bold text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-700"
                                title="Editar Produto"
                            >
                                <FiEdit size={16} />
                                <span>Editar</span>
                            </button>
                            {userData?.role === "admin" && (
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 font-bold text-white transition-colors rounded-lg bg-rose-600 hover:bg-rose-700"
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