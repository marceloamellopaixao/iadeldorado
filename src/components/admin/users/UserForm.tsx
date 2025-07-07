import { useState, useEffect } from "react";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";
import { toast } from "react-toastify";
import { FiSave, FiX } from "react-icons/fi";

interface UserFormProps {
    user: User | null;
    onSuccess: () => void;
    onClose: () => void;
}

const initialState: Omit<User, "id" | "createdAt" | "updatedAt"> = {
    name: "",
    email: "",
    telephone: "",
    role: "customer",
};

export default function UserForm({ user, onSuccess, onClose }: UserFormProps) {
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                telephone: user.telephone,
                role: user.role,
            });
        } else {
            setFormData(initialState);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = { ...formData, updatedAt: serverTimestamp() };
            if (user?.id) {
                await setDoc(doc(db, "users", user.id), userData, { merge: true });
                toast.success("Usuário atualizado com sucesso!");
            } else {
                // Para novos usuários, o UID será o ID do documento
                const newUserRef = doc(collection(db, "users")); 
                await setDoc(newUserRef, { ...userData, uid: newUserRef.id, createdAt: serverTimestamp() });
                toast.success("Usuário criado com sucesso!");
            }
            onSuccess();
        } catch {
            toast.error("Erro ao salvar o usuário.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <button onClick={onClose} className="lg:hidden absolute top-4 right-4 text-slate-500 hover:text-rose-600 transition-colors z-10" aria-label="Fechar formulário">
                <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className={labelBaseStyle}>Nome Completo</label>
                    <input id="name" type="text" placeholder="Nome do usuário" className={inputBaseStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                    <label htmlFor="email" className={labelBaseStyle}>E-mail</label>
                    <input id="email" type="email" placeholder="email@exemplo.com" className={inputBaseStyle} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                    <label htmlFor="telephone" className={labelBaseStyle}>Telefone (WhatsApp)</label>
                    <input id="telephone" type="tel" placeholder="(11) 99999-9999" className={inputBaseStyle} value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                </div>
                <div>
                    <label htmlFor="role" className={labelBaseStyle}>Cargo (Permissão)</label>
                    <select id="role" className={inputBaseStyle} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                        <option value="customer">Cliente</option>
                        <option value="seller">Vendedor</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                        <span>Cancelar</span>
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-slate-400">
                        <FiSave />
                        <span>{loading ? 'Salvando...' : (user ? 'Atualizar' : 'Cadastrar')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}