import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const withAuth = (allowedRoles: string[]) => (WrappedComponent: React.ComponentType) => {
    const Wrapper = () => {
        const { userData, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (loading) return; // Wait for loading to finish

            // Se a rota não requer autenticação (allowedRoles vazio), permite acesso
            if (allowedRoles.length === 0) return;

            // Se não tem usuário OU se tem usuário mas não tem permissão, redireciona
            if (!userData || (allowedRoles.length > 0 && !allowedRoles.includes(userData.role))) {
                router.push('/auth/login?redirect=' + encodeURIComponent(router.asPath)); // Redireciona para a página inicial ou outra página de sua escolha
            }

        }, [userData, loading, router]);

        if (loading) {
            return <LoadingSpinner message='Verificando usuário...' />; // Exibe um loading spinner enquanto verifica o estado de autenticação
        };

        // Se a rota não requer autenticação ou se o usuário tem permissão, renderiza o componente
        if (allowedRoles.length === 0 || (userData && allowedRoles.includes(userData.role))) {
            return <WrappedComponent />;
        }

        // Se o usuário não tem permissão, redireciona para a página de produtos
        if (userData && !allowedRoles.includes(userData.role)) {
            router.push('/products');
            return null; // Retorna null enquanto redireciona
        }

    };

    return Wrapper;
};

export default withAuth;