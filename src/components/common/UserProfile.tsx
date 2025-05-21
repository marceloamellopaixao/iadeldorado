import { useAuth } from '@/contexts/AuthContext'
import ButtonRouter from '@/components/common/ButtonRouter'
import LogoutButton from '@/components/common/LogoutButton'
import Image from 'next/image'
import userIcon from '@/assets/icons/user-solid.svg'

export default function UserProfile() {
    const { userData } = useAuth()


    return (
        <div className='flex items-center gap-4'>
            <div className='text-right hidden md:flex flex-col'>
                <p className='text-sm font-semibold'>{userData?.name}</p>
                <p className='text-xs text-white-500'>
                    {userData?.role === 'admin' ? 'Administrador' : userData?.role === 'seller' ? 'Vendedor' : 'Cliente'}
                </p>
            </div>
            <ButtonRouter
                disabled={false}
                color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-2 rounded hover:bg-blue-800 transition duration-300"
                rota="/auth/profile"
            >
                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                Perfil
            </ButtonRouter>
            <LogoutButton />
        </div>
    )
}