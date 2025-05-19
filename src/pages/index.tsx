import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Home() {
  const { user, userData } = useAuth()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(userData?.role === 'admin' ? '/admin/products' : '/products')
    } else {
      router.push('/products')
    }
  }, [user, userData, router])

  useEffect(() => {
    // Simula um carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [])

  if (loading) {
    return <LoadingSpinner message='Carregando...' />
  }

  return null;
}