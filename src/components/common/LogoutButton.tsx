import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/auth/login"); // Redireciona para a página de login após o logout
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <div className="w-full justify-center md:w-auto">
            <button
                onClick={handleLogout}
                className="block w-full bg-red-600 text-white px-4 py-2 hover:bg-red-800 transition duration-300 md:bg-transparent md:hover:bg-red-800"
            >
                Sair
            </button>
        </div>

    );
}