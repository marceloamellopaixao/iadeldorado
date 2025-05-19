import { useRef, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/router";
import withAuth from "@/hooks/withAuth";
import Image from "next/image";
import eyeIcon from "@/assets/icons/eye-solid.svg";
import eyeCloseIcon from "@/assets/icons/eye-slash-solid.svg";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState("");
    const [telephone, setTelephone] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                email,
                telephone,
                role: "customer",
                createdAt: new Date(),
            });

            router.push('/')

        } catch (error) {
            setError(error instanceof Error ? error.message : "Erro ao criar conta");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);

        if (passwordInputRef.current) {
            passwordInputRef.current.type = showPassword ? "text" : "password";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Crie sua Conta</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Nome Completo</label>
                        <input
                            type="text" value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full text-gray-700 px-3 py-2 border-3 rounded border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Telefone (WhatsApp com DDD)</label>
                        <input
                            type="text" value={telephone}
                            onChange={(e) => setTelephone(e.target.value)}
                            className="w-full text-gray-700 px-3 py-2 border-3 rounded border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">E-mail</label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-gray-700 px-3 py-2 border-3 rounded border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Senha</label>
                        <div className="relative ">
                            <input
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full text-gray-700 px-3 py-2 border-3 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded"
                    >
                        Criar Conta
                    </button>
                </form>
            </div>
        </div>
    );
}

export default withAuth([])(Register); // Permite acesso a todos os usuários, mesmo não autenticados