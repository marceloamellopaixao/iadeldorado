import { withAuth } from '@/hooks/withAuth';
import UserDetailsForm from '@/components/account/UserDetailsForm';
import PasswordUpdateForm from '@/components/account/PasswordUpdateForm';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';

function ProfilePage() {
    const { user, userData } = useAuth();

    return (
        <>
            <Head>
                <title>Meu Perfil | IAD Eldorado</title>
                <meta name="description" content="Gerencie suas informações de perfil e senha." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Meu Perfil</h1>
                    <p className="text-slate-500 mt-1">Atualize seus dados pessoais e de acesso.</p>
                </div>
                
                {/* Grid para organizar os cards de formulário */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Card de Informações Pessoais */}
                    <div className='bg-white w-full p-6 rounded-xl shadow-md'>
                        <h2 className='text-xl text-slate-800 font-bold mb-4'>Informações Pessoais</h2>
                        <UserDetailsForm
                            initialData={{
                                name: userData?.name || '',
                                telephone: userData?.telephone || '',
                                email: user?.email || '',
                            }}
                        />
                    </div>

                    {/* Card de Alteração de Senha */}
                    <div className='bg-white w-full p-6 rounded-xl shadow-md'>
                        <h2 className='text-xl text-slate-800 font-bold mb-4'>Alterar Senha</h2>
                        <PasswordUpdateForm />
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth(['customer', 'seller', 'admin'])(ProfilePage);