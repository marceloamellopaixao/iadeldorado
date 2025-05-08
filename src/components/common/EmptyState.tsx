export default function EmptyState({ message }: { message: string }) {
    return (
        <div className="container mx-auto p-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
                <button onClick={() => { }} className="float-right font-bold">X</button>
            </div>
        </div>
    );
}

