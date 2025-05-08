import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import LoadingSpinner from "../../common/LoadingSpinner";

interface ProductTableProps {
    onEdit: (product: Product) => void;
}

export default function ProductTable({ onEdit }: ProductTableProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;
        const fetchProducts = async () => {

            try {
                const q = query(collection(db, "products"));

                unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const productsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Product[];
                    setProducts(productsData);
                });
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        await deleteDoc(doc(db, "products", id));
    };

    if (loading) {
        return <LoadingSpinner message="Carregando produtos..." />;
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 ">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-black">Nome</th>
                            <th className="px-6 py-3 text-left text-black">Preço</th>
                            <th className="px-6 py-3 text-left text-black">Estoque</th>
                            <th className="px-6 py-3 text-left text-black">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 text-black">{product.name}</td>
                                <td className="px-6 py-4 text-black">R$ {product.price.toFixed(2).replace(".", ",")}</td>
                                <td className="px-6 py-4 text-black">{product.stock}</td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}