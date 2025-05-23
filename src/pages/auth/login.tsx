import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/router";
import withAuth from "@/hooks/withAuth";
import Image from "next/image";
import eyeIcon from "@/assets/icons/eye-solid.svg";
import eyeCloseIcon from "@/assets/icons/eye-slash-solid.svg";
import Link from "next/link";
import Head from "next/head";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const { user } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch {
            setError("Email ou senha inválidos!");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);

        if (passwordInputRef.current) {
            passwordInputRef.current.type = showPassword ? "text" : "password";
        }
    };

    if (user) {
        router.push("/"); // Redireciona para a página inicial se o usuário já estiver logado
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Head>
                <title>IAD Eldorado - Login</title>
                <meta name="description" content="Página de login da IAD Eldorado." />
            </Head>
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-100 hover:scale-105 transition-all duration-300">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2 font-bold">E-mail</label>
                        <input
                            type="email" value={email}
                            placeholder="Digite seu e-mail"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-gray-700 px-3 py-2 border-3 rounded border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2 font-bold">Senha</label>
                        <div className="relative ">
                            <input
                                ref={passwordInputRef}
                                placeholder="Digite sua senha"
                                type={showPassword ? "text" : "password"} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full text-gray-700 px-3 py-2 border-3 border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer" type="button" onClick={togglePasswordVisibility}>
                                {showPassword ? (
                                    <Image src={eyeCloseIcon} alt="Ocultar senha" width={20} height={20} />
                                ) : (
                                    <Image src={eyeIcon} alt="Mostrar senha" width={20} height={20} />

                                )}
                            </button>
                        </div>
                        <Link href="/auth/forgot-password" className="text-blue-500 text-sm underline">
                            Esqueceu sua senha?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    )

}

export default withAuth([])(Login); // Permite acesso a todos os usuários, mesmo não autenticados