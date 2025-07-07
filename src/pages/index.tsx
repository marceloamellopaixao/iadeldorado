import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Home() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (userData?.role === 'admin') {
                router.push('/admin/products');
            } else if (userData?.role === 'seller') {
                router.push('/seller/orders');
            } else {
                router.push('/products');
            }
        }
    }, [userData, authLoading, router]);

    return (
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner message="Carregando..." />
        </div>
    );
}