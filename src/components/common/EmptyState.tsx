import { FiInbox } from "react-icons/fi";

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#e7d8be] bg-[#fffdf7] p-8 text-center shadow-sm">
      <FiInbox className="mx-auto mb-3 text-3xl text-[#8b5e34]" />
      <p className="text-sm font-medium text-[#5f3711]">{message}</p>
    </div>
  );
}
