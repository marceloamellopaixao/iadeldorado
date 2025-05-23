import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/contexts/AuthContext'
import ButtonRouter from "@/components/common/ButtonRouter";
import Link from 'next/link'
import Image from 'next/image'

// Logo Import
import Logo from '@/assets/images/logo-adeldorado.png'

// Icons Imports
import userIcon from '@/assets/icons/user-solid.svg'
import menuIcon from '@/assets/icons/bars-solid.svg'
import closeIcon from '@/assets/icons/times-white-solid.svg'
import pixIcon from '@/assets/icons/pix-brands.svg'
import relatorioIcon from '@/assets/icons/calendar-solid.svg'
import configIcon from '@/assets/icons/sliders-solid.svg'
import productIcon from '@/assets/icons/product-icon.svg'
import listProductIcon from '@/assets/icons/list-products-icon.svg'
import { useDropdownClose } from "@/hooks/useDropdownClose";

export default function Header() {
    const { user, userData } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { dropdownStates, setDropdownRef, toggleDropdown } = useDropdownClose();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <header>
            <nav className="bg-blue-600 text-white p-4">
                <div className='flex flex-wrap items-center justify-between p-4 gap-4'>

                    {/* Logo */}
                    <Link href="/products" className='flex items-center space-x-3 rtl:space-x-reverse' title='Página inicial'>
                        <Image src={Logo} alt="Logo" width={40} height={40} className="h-10 w-10" />
                        <span className='self-center hidden text-lg font-semibold whitespace-nowrap md:block dark:text-white'>IAD Eldorado - Cantina</span>
                    </Link>

                    {/* Botão hamburguer */}
                    <button
                        data-collapse-toggle="navbar-default"
                        type='button'
                        className='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:cursor-pointer'
                        aria-controls="navbar-default" aria-expanded="false"
                        onClick={toggleMenu}
                    >
                        <span>
                            {isMenuOpen ?
                                <Image src={closeIcon} alt="Close menu" title='Fechar menu' />
                                :
                                <Image src={menuIcon} alt="Open menu" title='Abrir menu' />
                            }
                        </span>
                    </button>
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} justify-center w-full md:block md:w-auto`} id="navbar-default">
                        <ul className='flex flex-col items-center gap-2 rounded-lg bg-blue-600 md:mt-0 md:flex-row md:space-x-2 md:space-y-0'>
                            {user && userData?.role === 'admin' ? (
                                <div className="w-full flex flex-col md:flex-row gap-2">
                                    {/* BOTÃO DE SITE DA IGREJA */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="https://www.iadeldorado.com.br/"
                                            disabled={false}
                                        >
                                            <span className="whitespace-nowrap">Site da Igreja</span>
                                        </ButtonRouter>
                                    </li>
                                    {/* DROPDOWN DE PRODUTOS */}
                                    <li>
                                        <div className="flex flex-col md:flex-row md:relative">
                                            <button
                                                onClick={() => toggleDropdown('products')}
                                                className="flex flex-row items-center justify-between w-full bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 md:w-auto"
                                            >
                                                <span className="whitespace-nowrap">Produtos</span>
                                                <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform ${dropdownStates.products ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div ref={(el) => setDropdownRef('products', el)} className={`${dropdownStates.products ? 'block' : 'hidden'} w-full md:mt-12 md:absolute md:z-10 md:bg-blue-500 md:divide-y md:divide-gray-100 md:rounded-lg md:shadow md:w-44`}>
                                                <ul className="space-y-1 bg-blue-500 md:py-2 md:text-sm">
                                                    <li>
                                                        <Link
                                                            href="/products"
                                                            className="block w-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={productIcon} alt="User Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Lista de Produtos</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/products"
                                                            className="block w-full bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={listProductIcon} alt="User Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Gerenciar Produtos</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>

                                    {/* DROPDOWN DE USUÁRIOS */}
                                    <li>
                                        <div className="flex flex-col md:flex-row md:relative">
                                            <button
                                                onClick={() => toggleDropdown('users')}
                                                className="flex flex-row items-center justify-between w-full bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 md:w-auto"
                                            >
                                                <span>Usuários</span>
                                                <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform ${dropdownStates.users ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div ref={(el) => setDropdownRef('users', el)} className={`${dropdownStates.users ? 'block' : 'hidden'} w-full md:mt-12 md:absolute md:z-10 md:bg-blue-500 md:divide-y md:divide-gray-100 md:rounded-lg md:shadow md:w-44`}>
                                                <ul className="space-y-1 bg-blue-500 md:py-2 md:text-sm">
                                                    <li>
                                                        {/* <Link
                                                            href="/admin/users"
                                                            className="block w-full bg-blue-600 text-white px-2 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                            // onClick={() => { alert("🚧Página em Construção🚧") }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Gerenciar Usuários</span>
                                                            </div>
                                                        </Link> */}

                                                        <button
                                                            className="block w-full bg-blue-600 text-white px-2 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800 hover:cursor-pointer"
                                                            onClick={() => { alert("🚧Página em Construção🚧") }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Gerenciar Usuários</span>
                                                            </div>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/auth/profile"
                                                            className="block w-full bg-blue-600 text-white px-2 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Meu Perfil</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>

                                    {/* DROPDOWN DE CONFIGURAÇÕES */}
                                    <li>
                                        <div className="flex flex-col md:flex-row md:relative">
                                            <button
                                                onClick={() => toggleDropdown('config')}
                                                className="flex flex-row items-center justify-between w-full bg-blue-500 text-white font-bold px-4 py-3 gap-2 rounded hover:bg-blue-800 transition duration-300 md:min-w-max md:w-auto"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Image src={configIcon} alt="Config Icon" width={20} height={20} />
                                                    <span className="whitespace-nowrap">Geral</span>
                                                </div>

                                                <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform ${dropdownStates.config ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                                </svg>
                                            </button>

                                            {/* Dropdown Menu */}
                                            <div ref={(el) => setDropdownRef('config', el)} className={`${dropdownStates.config ? 'block' : 'hidden'} w-full mt-1 md:absolute md:mt-12 md:z-10 md:bg-blue-500 md:divide-y md:divide-gray-100 md:rounded-lg md:shadow md:w-44`}>
                                                <ul className="space-y-1 bg-blue-500 md:py-2 md:text-sm">
                                                    <li>
                                                        <Link
                                                            href="/admin/pix-config"
                                                            className="block w-full bg-blue-600 text-white px-2 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={pixIcon} alt="PIX Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Configuração de PIX</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            href="/admin/reports"
                                                            className="block w-full bg-blue-600 text-white px-2 py-2 hover:bg-blue-700 transition duration-300 md:bg-transparent md:hover:bg-blue-800"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Image src={relatorioIcon} alt="Relatório Icon" width={20} height={20} />
                                                                <span className="whitespace-nowrap">Relatório de Vendas</span>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </li>

                                    {/* BOTÃO DE PEDIDOS */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/seller/orders"
                                            disabled={false}
                                        >
                                            Pedidos
                                        </ButtonRouter>
                                    </li>

                                    {/* BOTÃO DE LOGOUT */}
                                    <li>
                                        <Link
                                            href={!user ? "/auth/login" : ""}
                                            onClick={handleLogout}
                                            className="flex flex-row gap-2 bg-red-500 text-white font-bold px-4 py-3 rounded hover:bg-red-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                        >
                                            <span className="whitespace-nowrap">Sair</span>
                                        </Link>
                                    </li>
                                </div>
                            ) : (user && userData?.role === 'seller') ? (
                                <div className="w-full flex flex-col md:flex-row gap-2">
                                    {/* BOTÃO DE SITE DA IGREJA */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="https://www.iadeldorado.com.br/"
                                            disabled={false}
                                        >
                                            <span className="whitespace-nowrap">Site da Igreja</span>
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/products"
                                            disabled={false}
                                        >
                                            Produtos
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/seller/orders"
                                            disabled={false}
                                        >
                                            Pedidos
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/auth/profile"
                                            disabled={false}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                                                <span className="whitespace-nowrap">Meu Perfil</span>
                                            </div>
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <Link
                                            href={!user ? "/auth/login" : ""}
                                            onClick={handleLogout}
                                            className="flex flex-row gap-2 bg-red-500 text-white font-bold px-4 py-3 rounded hover:bg-red-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                        >
                                            <span>Sair</span>
                                        </Link>
                                    </li>
                                </div>
                            ) : (user && userData?.role === 'customer') ? (
                                <div className="w-full flex flex-col md:flex-row gap-2">
                                    {/* BOTÃO DE SITE DA IGREJA */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="https://www.iadeldorado.com.br/"
                                            disabled={false}
                                        >
                                            <span className="whitespace-nowrap">Site da Igreja</span>
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/products"
                                            disabled={false}
                                        >
                                            Produtos
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        {/* <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/orders"
                                            disabled={true}
                                        >
                                            Pedidos
                                        </ButtonRouter> */}

                                        <button
                                            className="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            onClick={() => { alert("🚧Página em Construção🚧") }}
                                        >
                                            <span className="whitespace-nowrap">Histórico de Pedidos</span>
                                        </button>
                                    </li>
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/auth/profile"
                                            disabled={false}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Image src={userIcon} alt="User Icon" width={20} height={20} />
                                                <span className="whitespace-nowrap">Meu Perfil</span>
                                            </div>
                                        </ButtonRouter>
                                    </li>
                                    <li>
                                        <Link
                                            href={!user ? "/auth/login" : ""}
                                            onClick={handleLogout}
                                            className="flex flex-row gap-2 bg-red-500 text-white font-bold px-4 py-3 rounded hover:bg-red-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                        >
                                            <span>Sair</span>
                                        </Link>
                                    </li>
                                </div>
                            ) : (
                                <div className="w-full flex flex-col md:flex-row gap-2">
                                    {/* BOTÃO DE SITE DA IGREJA */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="https://www.iadeldorado.com.br/"
                                            disabled={false}
                                        >
                                            <span className="whitespace-nowrap">Site da Igreja</span>
                                        </ButtonRouter>
                                    </li>
                                    {/* BOTÃO DE PRODUTOS */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/products"
                                            disabled={false}
                                        >
                                            Produtos
                                        </ButtonRouter>
                                    </li>
                                    {/* BOTÃO DE LOGIN */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/auth/login"
                                            disabled={false}
                                        >
                                            Login
                                        </ButtonRouter>
                                    </li>
                                    {/* BOTÃO DE CRIAR CONTA */}
                                    <li>
                                        <ButtonRouter
                                            color="flex flex-row gap-2 bg-blue-500 text-white font-bold px-4 py-3 rounded hover:bg-blue-800 transition duration-300 w-full justify-center md:w-auto md:justify-start whitespace-nowrap"
                                            rota="/auth/register"
                                            disabled={false}
                                        >
                                            Criar Conta
                                        </ButtonRouter>
                                    </li>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header >
    )
}