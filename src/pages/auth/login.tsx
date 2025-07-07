import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import withAuth from "@/hooks/withAuth";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout"; // Importando o novo layout
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { toast } from "react-toastify";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // O redirecionamento será tratado pelo HOC withAuth ou pelo hook useAuth
        } catch {
            toast.error("E-mail ou senha inválidos. Por favor, verifique.");
        } finally {
            setLoading(false);
        }
    };

    if (user) {
        router.push("/");
        return <div className="h-screen w-screen"></div>; // Retorna um placeholder enquanto redireciona
    }

    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 pr-10 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <>
            <Head>
                <title>Login | IAD Eldorado</title>
            </Head>
            <AuthLayout title="Acessar sua Conta">
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={labelBaseStyle}>E-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputBaseStyle} required />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelBaseStyle}>Senha</label>
                        <div className="relative">
                            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className={inputBaseStyle} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-sky-600">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        <div className="text-right mt-1">
                            <Link href="/auth/forgot-password" className="text-sm font-medium text-sky-600 hover:text-sky-800">
                                Esqueceu sua senha?
                            </Link>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors disabled:bg-slate-400">
                        {loading ? 'Entrando...' : <><FiLogIn/> Entrar</>}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-600">
                        Não tem uma conta?{' '}
                        <Link href="/auth/register" className="font-bold text-sky-600 hover:underline">
                            Crie uma agora
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        </>
    );
}

export default withAuth([])(Login);