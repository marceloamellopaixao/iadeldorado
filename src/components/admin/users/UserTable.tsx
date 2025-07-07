import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiMail, FiPhone, FiUser } from "react-icons/fi";

interface UserTableProps {
    onEdit: (user: User) => void;
}

// Função auxiliar para retornar a cor do badge com base no cargo
const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case 'admin':
            return 'bg-rose-100 text-rose-800';
        case 'seller':
            return 'bg-sky-100 text-sky-800';
        default:
            return 'bg-slate-200 text-slate-800';
    }
};

export default function UserTable({ onEdit }: UserTableProps) {
    const { users, loading } = useUsers();

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
        try {
            await deleteDoc(doc(db, "users", id));
            toast.success("Usuário excluído com sucesso!");
        } catch {
            toast.error("Não foi possível excluir o usuário.");
        }
    };

    if (loading) {
        return <LoadingSpinner message="Carregando usuários..." />;
    }

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">
                <FiUser size={40} className="mx-auto text-slate-400 mb-4" />
                <p>Nenhum usuário encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user) => (
                <div key={user.id} className="bg-white border border-slate-200 rounded-xl shadow-md p-5 flex flex-col justify-between h-full transition-shadow hover:shadow-lg">
                    {/* Corpo do Card */}
                    <div className="flex-grow">
                        <div className="flex justify-between items-start mb-4 gap-3">
                            <h3 className="text-slate-900 text-lg font-bold">{user.name}</h3>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getRoleBadgeColor(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <FiMail size={14} className="text-slate-400" />
                                <span>{user.email || "E-mail não cadastrado"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone size={14} className="text-slate-400" />
                                <span>{user.telephone || "Telefone não cadastrado"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rodapé com Ações */}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-4">
                        <button onClick={() => onEdit(user)} className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors">
                            <FiEdit size={16} />
                            <span>Editar</span>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors">
                            <FiTrash2 size={16} />
                            <span>Excluir</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}