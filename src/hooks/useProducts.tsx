import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'products'), where('status', '==', true));
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setProducts(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }) as Product));
                setLoading(false);
            },
            (err) => {
                setError('Erro ao carregar produtos');
                console.error(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    return { products, loading, error };
};