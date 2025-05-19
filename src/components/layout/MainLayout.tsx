// src/components/layout/MainLayout.tsx
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/common/UserProfile'
import ButtonRouter from '@/components/common/ButtonRouter'
import Link from 'next/link'

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/products" className='text-xl font-bold'>IAD Eldorado - Cantina</Link>
                    {!user && (
                        <div className="flex space-x-4">
                            <ButtonRouter
                                nameButton="Entrar"
                                color="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-300 hover:text-black transition duration-300"
                                rota="/auth/login"
                            />
                            <ButtonRouter
                                nameButton="Registrar"
                                color="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-300 hover:text-black transition duration-300"
                                rota="/auth/register"
                            />
                        </div>
                    )}
                    {user && <UserProfile />}
                </div>
            </header>
            <main>{children}</main>
        </div>
    )
}