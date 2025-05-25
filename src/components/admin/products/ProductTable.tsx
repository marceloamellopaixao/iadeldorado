import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsAdmin } from "@/hooks/useProductsAdmin";

interface ProductTableProps {
    onEdit: (product: Product) => void;
}

export default function ProductTable({ onEdit }: ProductTableProps) {
    const { userData } = useAuth();
    const { products, loading } = useProductsAdmin();

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        await deleteDoc(doc(db, "products", id));
    };

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div className="bg-gray-800 border border-zinc-400 rounded-xl shadow-lg p-4 flex flex-col justify-between h-full transition hover:shadow-xl hover:scale-105 duration-300 ease-linear" key={product.id}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-lg font-semibold mb-2">{product.name}</h3>
                    </div>
                    <div className="flex items-center w-full h-15 mb-4">
                        <p className="text-zinc-400 text-sm mb-4">{product.description ? product.description : "Sem descrição"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                    </div>
                    <div className="flex flex-col justify-between mb-4">
                        <p className="text-white font-bold text-lg mb-2">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                        <p className={`text-sm ${product.stock <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {product.stock <= 0 ? 'Sem Estoque' : `Em Estoque: ${product.stock}`}
                            {product.status === false ? <span className="text-red-500"> (Inativo)</span> : <span className="text-green-500"> (Ativo)</span>}
                        </p>
                    </div>

                    <div className="flex justify-start gap-2">
                        {userData?.role === "admin" && (
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white  bg-red-500 hover:bg-red-900 transition-all duration-300 ease-linear"
                            >
                                Excluir
                            </button>
                        )

                        }
                        <button
                            onClick={() => onEdit(product)}
                            className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-700 transition-all duration-300 ease-linear"
                        >
                            Editar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}