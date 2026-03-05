import Head from "next/head";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";
import UserDetailsForm from "@/components/account/UserDetailsForm";
import { useAuth } from "@/contexts/AuthContext";
import { withAuth } from "@/hooks/withAuth";

function ProfilePage() {
    const { user, userData } = useAuth();

    return (
        <>
            <Head>
                <title>Meu Perfil | IAD Eldorado</title>
                <meta name="description" content="Gerencie suas informacoes de perfil e senha." />
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="cantina-panel mb-8 p-5">
                    <h1 className="cantina-title text-3xl font-bold">Meu Perfil</h1>
                    <p className="cantina-subtitle mt-1 text-sm">Atualize seus dados pessoais e de acesso.</p>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                    <div className="cantina-panel w-full p-6">
                        <h2 className="mb-4 text-xl font-bold text-slate-800">Informacoes Pessoais</h2>
                        <UserDetailsForm
                            initialData={{
                                name: userData?.name || "",
                                telephone: userData?.telephone || "",
                                email: user?.email || "",
                            }}
                        />
                    </div>

                    <div className="cantina-panel w-full p-6">
                        <h2 className="mb-4 text-xl font-bold text-slate-800">Alterar Senha</h2>
                        <PasswordUpdateForm />
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth(["customer", "seller", "admin"])(ProfilePage);
