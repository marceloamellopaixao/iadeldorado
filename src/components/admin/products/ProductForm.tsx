import { useState, useEffect } from "react";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types/product";
import { toast } from "react-toastify";
import { FiSave, FiX } from "react-icons/fi";

interface ProductFormProps {
    product: Product | null;
    onSuccess: () => void;
    onClose: () => void; 
}

const initialState: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    status: true,
};

export default function ProductForm({ product, onSuccess, onClose }: ProductFormProps) {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

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
            setFormData(initialState);
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const productData = { ...formData, updatedAt: serverTimestamp() };

            if (product?.id) {
                await setDoc(doc(db, "products", product.id), productData, { merge: true });
                toast.success("Produto atualizado com sucesso!");
            } else {
                const newProductRef = doc(collection(db, "products"));
                await setDoc(newProductRef, { ...productData, createdAt: serverTimestamp() });
                toast.success("Produto cadastrado com sucesso!");
            }
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar o produto:", error);
            toast.error("Erro ao salvar o produto. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <div className="relative p-6 bg-white shadow-lg rounded-xl">
            <button 
                onClick={onClose}
                className="absolute z-10 transition-colors lg:hidden top-4 right-4 text-slate-500 hover:text-rose-600"
                aria-label="Fechar formulário"
            >
                <FiX size={24} />
            </button>

            <h2 className="mb-6 text-2xl font-bold text-slate-800">
                {product ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className={labelBaseStyle}>Nome do Produto</label>
                    <input id="name" type="text" placeholder="Ex: Pastel de Frango" className={inputBaseStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div>
                    <label htmlFor="description" className={labelBaseStyle}>Descrição</label>
                    <textarea id="description" placeholder="Uma breve descrição do produto" className={inputBaseStyle} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                        <label htmlFor="price" className={labelBaseStyle}>Preço (R$)</label>
                        <input id="price" type="number" step="0.01" min="0" className={inputBaseStyle} value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required />
                    </div>
                    <div>
                        <label htmlFor="stock" className={labelBaseStyle}>Estoque</label>
                        <input id="stock" type="number" min="0" className={inputBaseStyle} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })} required />
                    </div>
                </div>

                 <div>
                    <label htmlFor="category" className={labelBaseStyle}>Categoria</label>
                    <input id="category" type="text" placeholder="Ex: Salgados" className={inputBaseStyle} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                </div>

                <div>
                    <label htmlFor="status" className={labelBaseStyle}>Status</label>
                    <select id="status" className={inputBaseStyle} value={String(formData.status)} onChange={(e) => setFormData({ ...formData, status: e.target.value === "true" })}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={onClose} className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50">
                        <span>Cancelar</span>
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 font-bold text-white transition-colors bg-teal-500 rounded-lg hover:bg-teal-600 disabled:bg-slate-400">
                        <FiSave />
                        <span>{loading ? 'Salvando...' : (product ? 'Atualizar' : 'Cadastrar')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}