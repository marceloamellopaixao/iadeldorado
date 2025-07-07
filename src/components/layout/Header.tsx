import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/contexts/AuthContext';
import { useDropdownClose } from "@/hooks/useDropdownClose";
import Link from 'next/link';
import Image from 'next/image';

// Logo Import
import Logo from '@/assets/images/logo-adeldorado.png';

// Imports dos Ícones (react-icons/fi)
import {
    FiUser,
    FiMenu,
    FiX,
    FiSettings,
    FiBox,
    FiList,
    FiShoppingCart,
    FiLogOut,
    FiChevronDown,
    FiDollarSign,
    FiGlobe,
    FiClipboard,
    FiPlusCircle
} from 'react-icons/fi';

export default function Header() {
    const { user, userData } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { dropdownStates, setDropdownRef, toggleDropdown } = useDropdownClose();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    // Estilos reutilizáveis para os botões e links do menu
    const menuItemBaseStyle = "flex items-center gap-3 w-full px-4 py-3 font-semibold text-white rounded-lg transition-colors duration-300";
    const buttonStyle = `${menuItemBaseStyle} bg-blue-500 hover:bg-blue-700 justify-center md:justify-start`;
    const dropdownButtonStyle = `${buttonStyle} justify-between`;
    const dropdownLinkStyle = "flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-blue-700 rounded-md transition-colors duration-300";

    return (
        <header className="bg-sky-700 shadow-lg sticky top-0 z-1">
            <nav className="container mx-auto px-4">
                <div className='flex flex-wrap items-center justify-between py-3'>

                    {/* Logo */}
                    <Link href="/products" className='flex items-center gap-3' title='Página inicial'>
                        <Image src={Logo} alt="Logo IAD Eldorado Cantina" width={40} height={40} className="rounded-full border-2 border-white" />
                        <span className='self-center text-xl font-bold text-white whitespace-nowrap hidden sm:block'>
                            IAD Eldorado - Cantina
                        </span>
                    </Link>

                    {/* Botão Hamburguer (Mobile) */}
                    <button
                        type='button'
                        className='inline-flex items-center justify-center p-2 w-10 h-10 text-white rounded-lg md:hidden hover:bg-sky-600 focus:outline-none'
                        aria-controls="navbar-default"
                        aria-expanded={isMenuOpen}
                        onClick={toggleMenu}
                    >
                        <span className="sr-only">{isMenuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
                        {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>

                    {/* Menu de Navegação */}
                    <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto mt-4 md:mt-0`} id="navbar-default">
                        <ul className='flex flex-col items-center gap-2 md:flex-row md:gap-3'>

                            {/* Menus para ADMIN */}
                            {user && userData?.role === 'admin' && (
                                <>
                                    {/* Link Site da Igreja */}
                                    <li>
                                        <a href="https://iadeldorado.com.br/" target="_blank" rel="noopener noreferrer" className={buttonStyle}>
                                            <FiGlobe size={20} />
                                            <span>Site da Igreja</span>
                                        </a>
                                    </li>

                                    {/* Dropdown de Produtos */}
                                    <li className="relative w-full md:w-auto">
                                        <button onClick={() => toggleDropdown('products')} className={dropdownButtonStyle}>
                                            <span className="flex items-center gap-3"><FiBox size={20} /> Produtos</span>
                                            <FiChevronDown className={`transition-transform duration-300 ${dropdownStates.products ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <div ref={(el) => setDropdownRef('products', el)} className={`${dropdownStates.products ? 'block' : 'hidden'} mt-2 w-full md:absolute md:right-0 md:w-56 bg-blue-600 rounded-lg shadow-xl z-20`}>
                                            <ul className="p-2 space-y-1">
                                                <li><Link href="/products" className={dropdownLinkStyle}><FiList size={20} /> <span>Lista de Produtos</span></Link></li>
                                                <li><Link href="/admin/products" className={dropdownLinkStyle}><FiClipboard size={20} /> <span>Gerenciar Produtos</span></Link></li>
                                            </ul>
                                        </div>
                                    </li>

                                    {/* Dropdown de Usuários */}
                                    <li className="relative w-full md:w-auto">
                                        <button onClick={() => toggleDropdown('users')} className={dropdownButtonStyle}>
                                            <span className="flex items-center gap-3"><FiUser size={20} /> Usuários</span>
                                            <FiChevronDown className={`transition-transform duration-300 ${dropdownStates.users ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <div ref={(el) => setDropdownRef('users', el)} className={`${dropdownStates.users ? 'block' : 'hidden'} mt-2 w-full md:absolute md:right-0 md:w-56 bg-blue-600 rounded-lg shadow-xl z-20`}>
                                            <ul className="p-2 space-y-1">
                                                <li><Link href="/admin/users" className={dropdownLinkStyle}><FiList size={20} /> <span>Gerenciar Usuários</span></Link></li>
                                                <li><Link href="/auth/profile" className={dropdownLinkStyle}><FiUser size={20} /> <span>Meu Perfil</span></Link></li>
                                            </ul>
                                        </div>
                                    </li>

                                    {/* Dropdown de Pedidos */}
                                    <li className="relative w-full md:w-auto">
                                        <button onClick={() => toggleDropdown('orders')} className={dropdownButtonStyle}>
                                            <span className="flex items-center gap-3"><FiShoppingCart size={20} /> Pedidos</span>
                                            <FiChevronDown className={`transition-transform duration-300 ${dropdownStates.orders ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <div ref={(el) => setDropdownRef('orders', el)} className={`${dropdownStates.orders ? 'block' : 'hidden'} mt-2 w-full md:absolute md:right-0 md:w-56 bg-blue-600 rounded-lg shadow-xl z-20`}>
                                            <ul className="p-2 space-y-1">
                                                <li><Link href="/seller/orders" className={dropdownLinkStyle}><FiList size={20} /> <span>Gerenciar Pedidos</span></Link></li>
                                                <li><Link href="/seller/report" className={dropdownLinkStyle}><FiClipboard size={20} /> <span>Ver Relatório</span></Link></li>
                                            </ul>
                                        </div>
                                    </li>

                                    {/* Dropdown de Configurações */}
                                    <li className="relative w-full md:w-auto">
                                        <button onClick={() => toggleDropdown('config')} className={dropdownButtonStyle}>
                                            <span className="flex items-center gap-3"><FiSettings size={20} /> Geral</span>
                                            <FiChevronDown className={`transition-transform duration-300 ${dropdownStates.config ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <div ref={(el) => setDropdownRef('config', el)} className={`${dropdownStates.config ? 'block' : 'hidden'} mt-2 w-full md:absolute md:right-0 md:w-56 bg-blue-600 rounded-lg shadow-xl z-20`}>
                                            <ul className="p-2 space-y-1">
                                                <li><Link href="/admin/pix-config" className={dropdownLinkStyle}><FiDollarSign size={20} /> <span>Configuração PIX</span></Link></li>
                                            </ul>
                                        </div>
                                    </li>
                                </>
                            )}

                            {/* Menus para VENDEDOR (SELLER) */}
                            {user && userData?.role === 'seller' && (
                                <>
                                    {/* Link Site da Igreja */}
                                    <li>
                                        <a href="https://iadeldorado.com.br/" target="_blank" rel="noopener noreferrer" className={buttonStyle}>
                                            <FiGlobe size={20} />
                                            <span>Site da Igreja</span>
                                        </a>
                                    </li>

                                    {/* Dropdown de Produtos */}
                                    <li className="relative w-full md:w-auto">
                                        <button onClick={() => toggleDropdown('products')} className={dropdownButtonStyle}>
                                            <span className="flex items-center gap-3"><FiBox size={20} /> Produtos</span>
                                            <FiChevronDown className={`transition-transform duration-300 ${dropdownStates.products ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <div ref={(el) => setDropdownRef('products', el)} className={`${dropdownStates.products ? 'block' : 'hidden'} mt-2 w-full md:absolute md:right-0 md:w-56 bg-blue-600 rounded-lg shadow-xl z-20`}>
                                            <ul className="p-2 space-y-1">
                                                <li><Link href="/products" className={dropdownLinkStyle}><FiList size={20} /> <span>Lista de Produtos</span></Link></li>
                                                <li><Link href="/admin/products" className={dropdownLinkStyle}><FiClipboard size={20} /> <span>Gerenciar Produtos</span></Link></li>
                                            </ul>
                                        </div>
                                    </li>

                                    {/* Link para Pedidos */}
                                    <li>
                                        <Link href="/seller/orders" className={buttonStyle}>
                                            <FiShoppingCart size={20} />
                                            <span>Pedidos</span>
                                        </Link>
                                    </li>

                                    {/* Link para Perfil */}
                                    <li>
                                        <Link href="/auth/profile" className={buttonStyle}>
                                            <FiUser size={20} />
                                            <span>Meu Perfil</span>
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Menus para CLIENTE (CUSTOMER) */}
                            {user && userData?.role === 'customer' && (
                                <>
                                    <li>
                                        <a href="https://iadeldorado.com.br/" target="_blank" rel="noopener noreferrer" className={buttonStyle}>
                                            <FiGlobe size={20} />
                                            <span>Site da Igreja</span>
                                        </a>
                                    </li>
                                    <li>
                                        <Link href="/products" className={buttonStyle}>
                                            <FiBox size={20} />
                                            <span>Produtos</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={() => alert("🚧 Página em Construção 🚧")} className={buttonStyle}>
                                            <FiList size={20} />
                                            <span>Histórico de Pedidos</span>
                                        </button>
                                    </li>
                                    <li>
                                        <Link href="/auth/profile" className={buttonStyle}>
                                            <FiUser size={20} />
                                            <span>Meu Perfil</span>
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Botão de Sair ou Entrar */}
                            <li>
                                {user ? (
                                    <button onClick={handleLogout} className={`${menuItemBaseStyle} bg-rose-600 hover:bg-rose-500 justify-center md:justify-start`}>
                                        <FiLogOut size={20} />
                                        <span>Sair</span>
                                    </button>
                                ) : (
                                    // O container dos botões também foi ajustado com 'md:w-auto'
                                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                        <div>
                                            <Link href="/auth/login" className={buttonStyle}>
                                                <FiUser size={20} />
                                                <span>Login</span>
                                            </Link>
                                        </div>
                                        <div>
                                            <Link href="/auth/register" className={`${menuItemBaseStyle} bg-teal-500 hover:bg-teal-400 justify-center md:justify-start`}>
                                                <FiPlusCircle size={20} />
                                                <span>Criar Conta</span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
}