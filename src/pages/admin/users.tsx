import withAuth from "@/hooks/withAuth";
import Head from "next/head";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import UserTable from "@/components/admin/users/UserTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import UserForm from "@/components/admin/users/UserForm";

function Users() {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simula um carregamento de dados
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [])

    if (loading) {
        return <LoadingSpinner message="Carregando usuários..." />;
    }

    return (
        <div className="container mx-auto p-4">
            <Head>
                <title>IAD Eldorado - Configuração de Usuários</title>
                <meta name="description" content="Configuração do sistema de gerenciamento de usuários na IAD Eldorado." />
            </Head>
            <h1 className="text-white text-2xl font-bold mb-6">Configuração de Usuários</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UserTable onEdit={setEditingUser} />
                </div>
                <div className="lg:col-span-1">
                    <UserForm
                        user={editingUser}
                        onClear={() => setEditingUser(null)}
                        onSuccess={() => setEditingUser(null)}
                    />
                </div>
            </div>
        </div >
    );
}

export default withAuth(['admin'])(Users);