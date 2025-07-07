import withAuth from "@/hooks/withAuth";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import Link from "next/link";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";

function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
            setTimeout(() => router.push("/auth/login"), 4000);
        } catch {
            toast.error("Falha ao enviar. Verifique o e-mail fornecido.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <>
            <Head>
                <title>Recuperar Senha | IAD Eldorado</title>
            </Head>
            <AuthLayout title="Recuperar Senha">
                <p className="text-center text-slate-600 text-sm mb-6">
                    Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={labelBaseStyle}>E-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputBaseStyle} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                        {loading ? 'Enviando...' : <><FiSend/> Enviar Link de Recuperação</>}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                     <Link href="/auth/login" className="font-bold text-slate-600 hover:text-sky-600 flex items-center justify-center gap-2">
                        <FiArrowLeft/> Voltar para o Login
                    </Link>
                </div>
            </AuthLayout>
        </>
    );
}

export default withAuth([])(ForgotPassword);