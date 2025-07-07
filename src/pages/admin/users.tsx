import { useState } from "react";
import withAuth from "@/hooks/withAuth";
import Head from "next/head";
import { User } from "@/types/user";
import UserTable from "@/components/admin/users/UserTable";
import UserForm from "@/components/admin/users/UserForm";
import { FiPlus } from "react-icons/fi";

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
                <title>Gerenciar Usuários | IAD Eldorado</title>
                <meta name="description" content="Adicione, edite e gerencie os usuários do sistema." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Gerenciar Usuários</h1>
                        <p className="text-slate-500 mt-1">Adicione, edite e visualize os usuários do sistema.</p>
                    </div>
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors">
                        <FiPlus/>
                        <span>Adicionar Novo</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <UserTable onEdit={handleEdit} />
                    </div>

                    {/* MODO DESKTOP: Formulário fixo */}
                    <div className="hidden lg:block lg:sticky lg:top-24">
                        <UserForm
                            user={editingUser}
                            onClose={() => setEditingUser(null)}
                            onSuccess={() => setEditingUser(null)}
                        />
                    </div>

                    {/* MODO MOBILE/TABLET: Formulário como modal */}
                    {isFormVisible && (
                        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 flex items-start justify-center overflow-y-auto p-4 pt-12 sm:pt-20" onClick={handleCloseForm}>
                            <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                <UserForm
                                    user={editingUser}
                                    onClose={handleCloseForm}
                                    onSuccess={handleCloseForm}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth(['admin'])(Users);