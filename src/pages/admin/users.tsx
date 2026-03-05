import { useState } from "react";
import Head from "next/head";
import { FiPlus } from "react-icons/fi";
import UserForm from "@/components/admin/users/UserForm";
import UserTable from "@/components/admin/users/UserTable";
import withAuth from "@/hooks/withAuth";
import { User } from "@/types/user";

function Users() {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormVisible(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setTimeout(() => setEditingUser(null), 300);
    };

    return (
        <>
            <Head>
                <title>Gerenciar Usuarios | IAD Eldorado</title>
                <meta name="description" content="Adicione, edite e gerencie os usuarios do sistema." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="cantina-panel mb-8 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="cantina-title text-3xl font-bold">Gerenciar Usuarios</h1>
                        <p className="cantina-subtitle mt-1 text-sm">Adicione, edite e visualize os usuarios do sistema.</p>
                    </div>
                    <button onClick={handleAddNew} className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-bold text-white transition-colors hover:bg-sky-500">
                        <FiPlus />
                        <span>Adicionar Novo</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <UserTable onEdit={handleEdit} />
                    </div>

                    <div className="hidden lg:sticky lg:top-24 lg:block">
                        <UserForm user={editingUser} onClose={() => setEditingUser(null)} onSuccess={() => setEditingUser(null)} />
                    </div>

                    {isFormVisible && (
                        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 sm:pt-20 lg:hidden" onClick={handleCloseForm}>
                            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <UserForm user={editingUser} onClose={handleCloseForm} onSuccess={handleCloseForm} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth(["admin"])(Users);
