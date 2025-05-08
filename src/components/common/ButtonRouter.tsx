import { useRouter } from "next/router";

interface ButtonProps {
    nameButton: string;
    color: string;
    rota: string;
}

export default function Button({ nameButton, color, rota }: ButtonProps) {
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            router.push(rota);
        } catch (error) {
            return;
        }
    }

    return (
        <button
            onClick={handleSubmit}
            className={`${color}  cursor-pointer`}
        >
            {nameButton}
        </button>
    );
}