
import Header from './Header'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main>
                {children}
            </main>
        </div>
    )
}