import { FiLoader } from "react-icons/fi";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dfcfb0] bg-[#fffdf7] p-8 text-center shadow-md">
      <FiLoader className="h-10 w-10 animate-spin text-[#5f3711]" />
      <p className="mt-4 text-base font-semibold text-[#5f3711]">{message || "Carregando..."}</p>
    </div>
  );
}
