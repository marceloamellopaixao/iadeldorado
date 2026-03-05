import { deleteDoc, doc } from "firebase/firestore";
import { FiEdit, FiMail, FiPhone, FiTrash2, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useUsers } from "@/hooks/useUsers";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";

interface UserTableProps {
    onEdit: (user: User) => void;
}

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case "admin":
            return "bg-rose-100 text-rose-800";
        case "seller":
            return "bg-sky-100 text-sky-800";
        default:
            return "bg-slate-200 text-slate-800";
    }
};

export default function UserTable({ onEdit }: UserTableProps) {
    const { users, loading } = useUsers();

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuario?")) return;
        try {
            await deleteDoc(doc(db, "users", id));
            toast.success("Usuario excluido com sucesso!");
        } catch {
            toast.error("Nao foi possivel excluir o usuario.");
        }
    };

    if (loading) {
        return <LoadingSpinner message="Carregando usuarios..." />;
    }

    if (users.length === 0) {
        return (
            <div className="cantina-panel p-8 text-center text-slate-500">
                <FiUser size={40} className="mx-auto mb-4 text-slate-400" />
                <p>Nenhum usuario encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {users.map((user) => (
                <article key={user.id} className="flex h-full flex-col justify-between rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-5 shadow-sm">
                    <div className="flex-grow">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <FiMail size={14} className="text-slate-400" />
                                <span>{user.email || "E-mail nao cadastrado"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone size={14} className="text-slate-400" />
                                <span>{user.telephone || "Telefone nao cadastrado"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button onClick={() => onEdit(user)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-bold text-white hover:bg-sky-500">
                            <FiEdit size={16} />
                            <span>Editar</span>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-500">
                            <FiTrash2 size={16} />
                            <span>Excluir</span>
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}
