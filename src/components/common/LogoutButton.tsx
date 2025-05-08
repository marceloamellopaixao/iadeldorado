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
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-800 transition duration-300 cursor-pointer"
        >
            Sair
        </button>
    );
}