import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

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
    const [error, setError] = useState("");
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.uid) {
            setError("Usuário não encontrado.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: formData.name,
                telephone: formData.telephone
            })
            alert("Dados atualizados com sucesso!");
        } catch (error) {
            alert("Erro ao atualizar os dados. Tente novamente mais tarde.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label htmlFor="name" className="block mb-1">Nome</label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div className="flex flex-col space-y-2">
                <label htmlFor="telephone" className="block mb-1">Celular (WhatsApp)</label>
                <input
                    type="text"
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="119123456789"
                    pattern="\d{2}\d{5}\d{4}"
                    title="Formato esperado: 119123456789"
                    required
                />
            </div>
            <div className="flex flex-col space-y-2">
                <label htmlFor="email" className="block mb-1">E-mail</label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    disabled
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white py-2 px-4 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <p className="text-center">Salvando Alterações...</p>
                    </div>
                ) : "Salvar Alterações"}
            </button>
        </form>
    );
}