import withAuth from "@/hooks/withAuth";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "@/lib/firebase"; // Certifique-se de que o caminho esteja correto

function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Email de recuperação enviado com sucesso!");
            setError("");
            setTimeout(() => router.push("/auth/login"), 3000);
        } catch (err) {
            setError("Falha ao enviar email de recuperação. Verifique o email fornecido.");
            setMessage("");
            console.error("Error sending password reset email:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Recuperar Senha</h2>
                
                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                        {message}
                    </div>
                )}
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                            required 
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Enviar Email de Recuperação
                    </button>
                </form>
                
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => router.push("/auth/login")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default withAuth([])(ForgotPassword);