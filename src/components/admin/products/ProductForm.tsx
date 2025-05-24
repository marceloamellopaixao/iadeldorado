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
        <div className="flex flex-col bg-gray-800 border border-zinc-400 rounded-xl shadow-lg p-4 gap-4 justify-between transition hover:shadow-xl hover:scale-105 duration-300 ease-linear">
            <h2 className="text-lg font-bold text-white">
                {product ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Nome</label>
                    <input
                        type="text"
                        placeholder="Nome do produto"
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Descrição</label>
                    <textarea
                        placeholder="Descrição do produto"
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-white">Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                            value={formData.price}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setFormData({ ...formData, price: isNaN(value) ? 0 : value });
                            }}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-white">Categoria</label>
                        <input
                            type="text"
                            placeholder="Categoria do produto"
                            className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-white">Estoque</label>
                        <input
                            type="text"
                            min="0"
                            max="999999999"
                            className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                            value={formData.stock}
                            onChange={(e) => {
                                const value = parseInt(e.target.value.replace(".", ","), 10);
                                setFormData({ ...formData, stock: isNaN(value) ? 0 : value });
                            }}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-white">Status</label>
                        <select
                            className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                            value={formData.status ? "true" : "false"}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}
                        >
                            <option value="true" className="text-black">Ativo</option>
                            <option value="false" className="text-black">Inativo</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    {product && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white  bg-red-500 hover:bg-red-900 transition-all duration-300 ease-linear"
                        >
                            Cancelar
                        </button>
                    )}

                    <button
                        type="submit"
                        className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-700 transition-all duration-300 ease-linear"
                    >
                        {product ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
