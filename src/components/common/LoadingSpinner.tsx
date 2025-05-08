export default function LoadingSpinner({ message }: { message: string }) {
    return (
        <div className='container mx-auto p-4'>
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-lg">{message}</p>
            </div>
        </div>
    );
}