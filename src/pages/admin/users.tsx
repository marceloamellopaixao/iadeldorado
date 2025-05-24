import withAuth from "@/hooks/withAuth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Head from "next/head";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";

function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribe: () => void;

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'users'), orderBy('name', 'asc'));
                unsubscribe = onSnapshot(q, (snapshot) => {
                    setUsers(snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }) as User));
                    setLoading(false);
                });
            } catch {
                setLoading(false);
            }
        };

        fetchUsers();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    return (
        <div className="container mx-auto p-4">
            <Head>
                <title>IAD Eldorado - Configuração de Usuários</title>
                <meta name="description" content="Configuração do sistema de gerenciamento de usuários na IAD Eldorado." />
            </Head>
            <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold mb-4">Configuração de Usuários</h1>
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Nome</th>
                                <th className="py-2 px-4 border-b">Celular</th>
                                <th className="py-2 px-4 border-b">Email</th>
                                <th className="py-2 px-4 border-b">Cargo</th>
                                <th className="py-2 px-4 border-b">Criado em</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.telephone}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">{user.role}</td>
                                    <td className="py-2 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default withAuth(['admin'])(Users);