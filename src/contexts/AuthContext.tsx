import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
    name: string;
    telephone: string;
    role: 'customer' | 'seller' | 'admin'
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                setUserData(userDoc.exists() ? userDoc.data() as UserData : null)
            } else {
                setUserData(null); // Usuário não está logado
            }

            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {!loading && children} {/* Renderiza os filhos apenas quando o loading for false */}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);