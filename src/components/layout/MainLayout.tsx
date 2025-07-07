import Header from './Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-slate-100">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            {/* Você pode adicionar um <Footer /> aqui no futuro e ele ficará "grudado" no final da página */}
        </div>
    );
}