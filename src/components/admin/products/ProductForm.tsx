import { useState, useEffect } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";

interface ProductFormProps {
    product: Product | null;
    onClear: () => void;
    onSuccess: () => void;
}

export default function ProductForm({ product, onClear, onSuccess }: ProductFormProps) {
    const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        status: true,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock: product.stock,
                status: product.status,
            });
        } else {
            setFormData({
                name: "",
                description: "",
                price: 0.00,
                category: "",
                stock: 0,
                status: true,
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                updatedAt: new Date()
            };

            if (product?.id) {
                // Atualiza o produto existente
                await setDoc(doc(db, "products", product.id), productData);
            } else {
                // Cria um novo produto
                const newProductRef = doc(collection(db, "products"));
                await setDoc(newProductRef, {
                    ...productData,
                    createdAt: new Date(),
                });
            }

            onSuccess(); // Chama a função de sucesso após salvar o produto
            onClear(); // Limpa o formulário após salvar
        } catch (error) {
            console.error("Erro ao salvar o produto:", error);
            alert("Erro ao salvar o produto. Tente novamente.");
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4 text-black">
                {product ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                            value={formData.price}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setFormData({ ...formData, price: isNaN(value) ? 0 : value });
                            }}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Estoque</label>
                        <input
                            type="text"
                            min="0"
                            max="999999999"
                            className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                            value={formData.stock}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace(".", ","), 10);
                                setFormData({ ...formData, stock: isNaN(value) ? 0 : value });
                            }}
                            required
                        />
                    </div>

                    <div className="flex items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            className="mt-1 block w-full border border-gray-300 text-gray-700 rounded-md shadow-sm p-2"
                            value={formData.status ? "true" : "false"}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                        >
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    {product && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        {product ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
