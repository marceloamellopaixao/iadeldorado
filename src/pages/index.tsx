import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const { user, userData } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (userData?.role === 'admin') {
      router.push('/admin/products')
    } else if (userData?.role === 'customer') {
      router.push('/products')
    } else if (userData?.role === 'seller') {
      router.push('/seller/orders')
    } else {
      router.push('/products')
    }
  }, [user, userData, router])

  return null;
}