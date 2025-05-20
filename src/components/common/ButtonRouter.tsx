import { useRouter } from "next/router";

interface ButtonProps {
    color: string;
    rota: string;
    children?: React.ReactNode;
}

export default function Button({ color, rota, children }: ButtonProps){
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            router.push(rota);
        } catch {
            return;
        }
    }

    return (
        <button
            onClick={handleSubmit}
            className={`${color}  cursor-pointer`}
        >
            {children}
        </button>
    );
}