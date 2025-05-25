import { useState, useEffect } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";

interface UserFormProps {
    user: User | null;
    onClear: () => void;
    onSuccess: () => void;
}

export default function UserForm({ user, onClear, onSuccess }: UserFormProps) {
    const [formData, setFormData] = useState<Omit<User, "id" | "createdAt" | "updatedAt">>({
        name: "",
        email: "",
        telephone: "",
        role: "user",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                telephone: user.telephone,
                role: user.role,
            });
        } else {
            setFormData({
                name: "",
                email: "",
                telephone: "",
                role: "user",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const userData = {
                ...formData,
                updatedAt: new Date()
            };

            if (user?.id) {
                // Atualiza o usuário existente
                await setDoc(doc(db, "users", user.id), userData);
            } else {
                // Cria um novo usuário
                const newUserRef = doc(collection(db, "users"));
                await setDoc(newUserRef, {
                    ...userData,
                    createdAt: new Date(),
                });
            }

            onSuccess(); // Chama a função de sucesso após salvar o usuário
            onClear(); // Limpa o formulário após salvar
        } catch (error) {
            console.error("Erro ao salvar o usuário:", error);
            alert("Erro ao salvar o usuário. Tente novamente.");
        }
    };

    return (
        <div className="flex flex-col bg-gray-800 border border-zinc-400 rounded-xl shadow-lg p-4 gap-4 justify-between transition hover:shadow-xl hover:scale-105 duration-300 ease-linear">
            <h2 className="text-lg font-bold text-white">
                {user ? 'Editar Usuário' : 'Adicionar Usuário'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Nome</label>
                    <input
                        type="text"
                        placeholder="Nome do usuário"
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Telefone (WhatsApp com DDD)</label>
                    <input
                        type="text"
                        placeholder="Celular do usuário"
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Email</label>
                    <input
                        type="email"
                        placeholder="Email do usuário"
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-white">Tipo de Usuário</label>
                    <select
                        className="block w-full border border-gray-300 text-white rounded-md shadow-sm p-2"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="customer" className="text-black">Cliente</option>
                        <option value="seller" className="text-black">Vendedor</option>
                        <option value="admin" className="text-black">Administrador</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    {user && (
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
                        {user ? 'Atualizar' : 'Cadastrar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
