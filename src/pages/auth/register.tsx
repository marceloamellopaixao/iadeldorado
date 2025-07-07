import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/router";
import withAuth from "@/hooks/withAuth";
import Link from "next/link";
import Head from "next/head";
import AuthLayout from "@/components/layout/AuthLayout";
import { FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";

function Register() {
    const [name, setName] = useState("");
    const [telephone, setTelephone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                name,
                email,
                telephone,
                role: "customer",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            router.push('/');
        } catch {
            toast.error("Erro ao criar conta. Verifique se o e-mail já está em uso.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputBaseStyle = "block w-full border-slate-300 rounded-lg shadow-sm p-3 pr-10 focus:ring-sky-500 focus:border-sky-500 transition bg-slate-50 text-slate-900";
    const labelBaseStyle = "block text-sm font-medium text-slate-700";

    return (
        <>
            <Head>
                <title>Criar Conta | IAD Eldorado</title>
            </Head>
            <AuthLayout title="Crie sua Conta">
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label htmlFor="name" className={labelBaseStyle}>Nome Completo</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className={inputBaseStyle} required />
                    </div>
                    <div>
                        <label htmlFor="telephone" className={labelBaseStyle}>Telefone (WhatsApp)</label>
                        <input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="(11) 99999-9999" className={inputBaseStyle} />
                    </div>
                     <div>
                        <label htmlFor="email" className={labelBaseStyle}>E-mail</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className={inputBaseStyle} required />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelBaseStyle}>Senha</label>
                        <div className="relative">
                            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Crie uma senha forte" className={inputBaseStyle} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-sky-600">
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 transition-colors disabled:bg-slate-400">
                        {loading ? 'Criando conta...' : <><FiUserPlus/> Criar Conta</>}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <p className="text-slate-600">
                        Já tem uma conta?{' '}
                        <Link href="/auth/login" className="font-bold text-sky-600 hover:underline">
                            Faça login
                        </Link>
                    </p>
                </div>
            </AuthLayout>
        </>
    );
}

export default withAuth([])(Register);