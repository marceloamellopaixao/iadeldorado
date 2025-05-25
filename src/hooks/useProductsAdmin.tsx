import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';

export const useProductsAdmin = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Busca os produtos do Firestore
    useEffect(() => {
        let unsubscribe: () => void;

        const loadProducts = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'products'), orderBy('name', 'asc'));
                unsubscribe = onSnapshot(q, (snapshot) => {
                    setProducts(snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }) as Product));
                    setLoading(false);
                });
            } catch {
                setLoading(false);
            }
        }

        loadProducts();

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

    return { products, loading };
};