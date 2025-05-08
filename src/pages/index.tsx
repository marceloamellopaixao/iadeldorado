import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { user, userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(userData?.role === 'admin' ? '/admin/products' : '/products')
    } else {
      router.push('/products')
    }
  }, [user, userData])

  return <LoadingSpinner message='Carregando...' /> // Página só faz redirecionamento
}