export function ErrorDisplay({ message, onRetry }: { message: string, onRetry: () => void }) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            <p>{message}</p>
            <button
                onClick={onRetry}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
            >
                Tentar novamente
            </button>
        </div>
    );
}