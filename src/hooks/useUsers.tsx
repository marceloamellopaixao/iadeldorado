import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types/user';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Busca os usuários do Firestore
    useEffect(() => {
        let unsubscribe: () => void;

        const loadUsers = async () => {
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
        }

        loadUsers();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Simula um carregamento de dados
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return { users, loading };
};