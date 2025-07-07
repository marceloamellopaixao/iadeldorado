import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
    message?: string; // Mensagem agora é opcional
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
    return (

        <div className="flex flex-col items-center justify-center p-8 text-center">
            <FiLoader className="animate-spin h-10 w-10 text-sky-600" />
            
            {message ? (
                <p className="mt-4 text-lg font-medium text-slate-600">{message}</p>
            ) : (
                <p className="mt-4 text-lg font-medium text-slate-600">Carregando...</p>
            )}
        </div>
    );
}