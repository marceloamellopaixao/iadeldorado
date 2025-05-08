import { useAuth } from '@/contexts/AuthContext'
import ButtonRouter from '@/components/common/ButtonRouter'
import LogoutButton from '@/components/common/LogoutButton'

export default function UserProfile() {
    const { userData } = useAuth()


    return (
        <div className='flex items-center gap-4'>
            <div className='text-right'>
                <p className='text-sm font-semibold'>{userData?.name}</p>
                <p className='text-xs text-white-500'>
                    {userData?.role === 'admin' ? 'Administrador' : userData?.role === 'seller' ? 'Vendedor' : 'Cliente'}
                </p>
            </div>
            <ButtonRouter
                nameButton="Perfil"
                color="bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-300 hover:text-black transition duration-300"
                rota="/auth/profile"
            />
            <LogoutButton />
        </div>
    )
}