
import Header from './Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main>
                {children}
            </main>
        </div>
    )
}