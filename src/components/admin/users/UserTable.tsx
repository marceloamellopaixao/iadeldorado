import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";
import LoadingSpinner from "../../common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";

interface UserTableProps {
    onEdit: (user: User) => void;
}

export default function UserTable({ onEdit }: UserTableProps) {
    const { userData } = useAuth();
    const { users, loading } = useUsers();

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
        await deleteDoc(doc(db, "users", id));
    };

    if (loading) {
        return <LoadingSpinner message="Carregando usuários..." />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <div className="bg-gray-800 border border-zinc-400 rounded-xl shadow-lg p-4 gap-2 flex flex-col justify-between h-full transition hover:shadow-xl hover:scale-105 duration-300 ease-linear" key={user.id}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">{user.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-zinc-400 text-sm">{user.email ? user.email : "Não tem e-mail"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-zinc-400 text-sm">{user.telephone ? user.telephone : "Não tem telefone"}</p>
                    </div>
                    <div className="flex flex-col justify-between">
                        <p className="text-zinc-400 text-sm">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Não tem cargo"}</p>
                    </div>

                    <div className="flex justify-start gap-2">
                        {userData?.role === "admin" && (
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white  bg-red-500 hover:bg-red-900 transition-all duration-300 ease-linear"
                            >
                                Excluir
                            </button>
                        )

                        }
                        <button
                            onClick={() => onEdit(user)}
                            className="px-4 py-2 border-2 border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-500 hover:bg-blue-700 transition-all duration-300 ease-linear"
                        >
                            Editar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}