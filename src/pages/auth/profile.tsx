import { withAuth } from '@/hooks/withAuth';
import UserDetailsForm from '@/components/account/UserDetailsForm';
import PasswordUpdateForm from '@/components/account/PasswordUpdateForm';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';


function ProfilePage() {
    const { user, userData } = useAuth();

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Head>
                <title>IAD Eldorado - Perfil</title>
                <meta name="description" content="Gerencie suas informações de perfil na IAD Eldorado." />
            </Head>
            <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>

            <div className='p-6 rounded-lg shadow-md mb-6'>
                <h2 className='text-xl font-semibold mb-4'>Informações Pessoais</h2>
                <UserDetailsForm
                    initialData={{
                        name: userData?.name || '',
                        telephone: userData?.telephone || '',
                        email: user?.email || ''
                    }}
                />
            </div>

            <div className='p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold mb-4'>Alterar Senha</h2>
                <PasswordUpdateForm />
            </div>

        </div>
    )
}

export default withAuth(['customer', 'seller', 'admin'])(ProfilePage)