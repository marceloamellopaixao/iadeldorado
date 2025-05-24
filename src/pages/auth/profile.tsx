import { withAuth } from '@/hooks/withAuth';
import UserDetailsForm from '@/components/account/UserDetailsForm';
import PasswordUpdateForm from '@/components/account/PasswordUpdateForm';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';


function ProfilePage() {
    const { user, userData } = useAuth();

    return (
        <div className="container mx-auto">
            <Head>
                <title>IAD Eldorado - Perfil</title>
                <meta name="description" content="Gerencie suas informações de perfil na IAD Eldorado." />
            </Head>
            <div className="flex min-w-100% flex-col items-center justify-center p-4 gap-4 md:flex-row">
                <div className='bg-[#041c35] w-full p-6 rounded-lg shadow-md'>
                    <h2 className='text-xl text-white font-bold mb-4'>Informações Pessoais</h2>
                    <UserDetailsForm
                        initialData={{
                            name: userData?.name || '',
                            telephone: userData?.telephone || '',
                            email: user?.email || ''
                        }}
                    />
                </div>

                <div className='bg-[#041c35] w-full p-6 rounded-lg shadow-md'>
                    <h2 className='text-xl text-white font-bold mb-4'>Alterar Senha</h2>
                    <PasswordUpdateForm />
                </div>
            </div>

        </div>
    )
}

export default withAuth(['customer', 'seller', 'admin'])(ProfilePage)