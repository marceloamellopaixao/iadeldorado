import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from '@/contexts/AuthContext';
import { useDropdownClose } from "@/hooks/useDropdownClose";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/router";
import React from 'react';

import Logo from '@/assets/images/logo-adeldorado.png';
import { 
    FiUser, FiMenu, FiX, FiSettings, FiBox, FiList, FiShoppingCart, 
    FiLogOut, FiChevronDown, FiDollarSign, FiGlobe, FiClipboard, FiFileText, FiLogIn, FiUserPlus
} from 'react-icons/fi';

interface NavItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    isDropdown?: boolean;
    children?: NavItem[];
    allowedRoles: ('admin' | 'seller' | 'customer' | 'guest')[];
}

interface MobileNavProps {
    items: NavItem[];
    onClose: () => void;
    onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ items, onClose, onLogout }) => (
    <div 
        className="lg:hidden fixed inset-0 bg-sky-700 z-50 p-4 flex flex-col"
        onClick={onClose}
    >
        <div className="flex justify-between items-center mb-8">
            <span className="text-white font-bold text-lg">Menu</span>
            <button onClick={onClose} className="text-white p-2">
                <FiX size={24} />
            </button>
        </div>
        <nav className="flex flex-col gap-4">
            {items.map(item => (
                <Link key={item.label} href={item.href || '#'} onClick={item.onClick || onClose} className="flex items-center gap-3 p-3 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors">
                    {item.icon}
                    <span>{item.label}</span>
                </Link>
            ))}
            <button onClick={onLogout} className="flex items-center gap-3 p-3 mt-auto text-white font-semibold bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors">
                <FiLogOut size={20} />
                <span>Sair</span>
            </button>
        </nav>
    </div>
);

interface DesktopDropdownProps {
    item: NavItem;
    dropdownStates: { [key: string]: boolean };
    setDropdownRef: (key: string, el: HTMLDivElement | null) => void;
    toggleDropdown: (key: string) => void;
}

const DesktopDropdown: React.FC<DesktopDropdownProps> = ({ item, dropdownStates, setDropdownRef, toggleDropdown }) => (
    <div className="relative" ref={(el) => setDropdownRef(item.label, el)}>
        <button onClick={() => toggleDropdown(item.label)} className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg transition-colors duration-300 hover:bg-sky-600">
            {item.icon}
            <span>{item.label}</span>
            <FiChevronDown className={`transition-transform duration-200 ${dropdownStates[item.label] ? 'rotate-180' : ''}`} />
        </button>
        {dropdownStates[item.label] && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2">
                <ul className="space-y-1">
                    {item.children?.map(child => (
                        <li key={child.label}>
                            <Link href={child.href || '#'} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                                {child.icon}
                                <span>{child.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

export default function Header() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { dropdownStates, setDropdownRef, toggleDropdown } = useDropdownClose();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/auth/login');
    };

    const allNavLinks: NavItem[] = [
        { label: 'Site da Igreja', href: 'https://iadeldorado.com.br/', icon: <FiGlobe size={20} />, allowedRoles: ['admin', 'seller', 'customer'] },
        {
            label: 'Produtos',
            isDropdown: true,
            icon: <FiBox size={20} />,
            allowedRoles: ['admin', 'seller'],
            children: [
                { label: 'Ver Vitrine', href: '/products', icon: <FiShoppingCart size={20} />, allowedRoles: ['admin', 'seller'] },
                { label: 'Gerenciar Produtos', href: '/admin/products', icon: <FiClipboard size={20} />, allowedRoles: ['admin', 'seller'] },
            ]
        },
        { label: 'Produtos', href: '/products', icon: <FiBox size={20} />, allowedRoles: ['customer', 'guest'] },
        {
            label: 'Vendas',
            isDropdown: true,
            icon: <FiDollarSign size={20} />,
            allowedRoles: ['admin', 'seller'],
            children: [
                { label: 'Gerenciar Pedidos', href: '/seller/orders', icon: <FiList size={20} />, allowedRoles: ['admin', 'seller'] },
                { label: 'Relatório de Vendas', href: '/seller/report', icon: <FiFileText size={20} />, allowedRoles: ['admin', 'seller'] },
            ]
        },
        {
            label: 'Meus Dados',
            isDropdown: true,
            icon: <FiUser size={20} />,
            allowedRoles: ['admin', 'seller', 'customer'],
            children: [
                { label: 'Meu Perfil', href: '/auth/profile', icon: <FiUser size={20} />, allowedRoles: ['admin', 'seller', 'customer'] },
                { label: 'Histórico de Pedidos', href: '/customer/orders', icon: <FiList size={20} />, allowedRoles: ['admin', 'seller', 'customer'] },
            ]
        },
        { label: 'Histórico de Pedidos', href: '/customer/orders', icon: <FiList size={20} />, allowedRoles: ['guest'] },
        {
            label: 'Administração',
            isDropdown: true,
            icon: <FiSettings size={20} />,
            allowedRoles: ['admin'],
            children: [
                { label: 'Gerenciar Usuários', href: '/admin/users', icon: <FiUser size={20} />, allowedRoles: ['admin'] },
                { label: 'Configurações PIX', href: '/admin/pix-config', icon: <FiDollarSign size={20} />, allowedRoles: ['admin'] },
            ]
        },
        { label: 'Login', href: '/auth/login', icon: <FiLogIn size={20}/>, allowedRoles: ['guest'] },
        { label: 'Criar Conta', href: '/auth/register', icon: <FiUserPlus size={20}/>, allowedRoles: ['guest'] },
    ];

    const visibleLinks = allNavLinks.filter(link => {
        const userRole = userData?.role || 'guest';
        return link.allowedRoles.includes(userRole);
    });

    return (
        <header className="bg-sky-700 shadow-md sticky top-0 z-30">
            <nav className="container mx-auto px-4">
                <div className='flex items-center justify-between py-3'>
                    <Link href="/" className='flex items-center gap-3' title='Página inicial'>
                        <Image src={Logo} alt="Logo IAD Eldorado Cantina" width={40} height={40} className="rounded-full border-2 border-sky-200" />
                        <span className='self-center text-xl font-bold text-white whitespace-nowrap hidden sm:block'>IAD Eldorado - Cantina</span>
                    </Link>

                    <div className='hidden lg:flex items-center gap-2'>
                        {visibleLinks.map(item => (
                             item.isDropdown ? (
                                <DesktopDropdown key={item.label} item={item} dropdownStates={dropdownStates} setDropdownRef={setDropdownRef} toggleDropdown={toggleDropdown} />
                             ) : (
                                <Link key={item.label} href={item.href || '#'} className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white rounded-lg transition-colors duration-300 hover:bg-sky-600">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                             )
                        ))}
                         {user && (
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 font-semibold text-white bg-rose-600 rounded-lg transition-colors duration-300 hover:bg-rose-500 ml-4">
                                <FiLogOut size={20} />
                                <span>Sair</span>
                            </button>
                        )}
                    </div>
                    
                    <button type='button' className='lg:hidden p-2 text-white' onClick={() => setIsMenuOpen(true)}>
                        <span className="sr-only">Abrir menu</span>
                        <FiMenu size={28} />
                    </button>
                </div>
            </nav>

            {isMenuOpen && <MobileNav items={visibleLinks} onClose={() => setIsMenuOpen(false)} onLogout={handleLogout}/>}
        </header>
    );
}