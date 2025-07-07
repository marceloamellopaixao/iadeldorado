import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { FiSave, FiLoader } from "react-icons/fi";

interface UserDetailsFormProps {
    initialData: {
        name: string;
        telephone: string;
        email: string;
    };
}

export default function UserDetailsForm({ initialData }: UserDetailsFormProps) {
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.uid) {
            toast.error("Usuário não encontrado. Por favor, faça login novamente.");
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: formData.name,
                telephone: formData.telephone,
                updatedAt: serverTimestamp(),
            });
            toast.success("Dados atualizados com sucesso!");
        } catch {
            toast.error("Erro ao atualizar os dados. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="name" className={labelBaseStyle}>Nome Completo</label>
                <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputBaseStyle} required />
            </div>
            <div>
                <label htmlFor="telephone" className={labelBaseStyle}>Celular (WhatsApp)</label>
                <input id="telephone" type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className={inputBaseStyle} placeholder="(11) 99999-9999" />
            </div>
            <div>
                <label htmlFor="email" className={labelBaseStyle}>E-mail (não pode ser alterado)</label>
                <input id="email" type="email" value={formData.email} className={`${inputBaseStyle} bg-slate-200 cursor-not-allowed`} disabled />
            </div>
            <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                    {loading ? (
                        <>
                            <FiLoader className="animate-spin" />
                            <span>Salvando...</span>
                        </>
                    ) : (
                        <>
                            <FiSave />
                            <span>Salvar Alterações</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}