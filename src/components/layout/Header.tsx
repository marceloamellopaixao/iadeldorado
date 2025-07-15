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

// ESTE É O COMPONENTE ATUALIZADO
const MobileNav: React.FC<MobileNavProps> = ({ items, onClose, onLogout }) => {
    // 1. Adicionamos um estado para controlar quais dropdowns estão abertos
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

    // 2. Função para abrir/fechar um dropdown específico
    const toggleDropdown = (label: string) => {
        // Impede que o menu inteiro feche ao clicar no dropdown
        // event.stopPropagation(); 
        setOpenDropdowns(prevState => ({
            ...prevState,
            [label]: !prevState[label]
        }));
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex lg:hidden bg-sky-700/80 backdrop-blur-sm"
            onClick={onClose} // Fecha se clicar no fundo
        >
            <div 
                className="flex flex-col w-4/5 h-full max-w-sm p-4 shadow-2xl bg-sky-700"
                onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar dentro do menu
            >
                <div className="flex items-center justify-between mb-8">
                    <span className="text-lg font-bold text-white">Menu</span>
                    <button onClick={onClose} className="p-2 text-white">
                        <FiX size={24} />
                    </button>
                </div>
                
                <nav className="flex flex-col flex-grow gap-2 overflow-y-auto">
                    {items.map(item => (
                        <div key={item.label}>
                            {item.isDropdown ? (
                                // 3. Se for um dropdown, renderiza como um botão de acordeão
                                <>
                                    <button 
                                        onClick={() => toggleDropdown(item.label)} 
                                        className="flex items-center justify-between w-full gap-3 p-3 font-semibold text-white transition-colors rounded-lg hover:bg-sky-600"
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                        <FiChevronDown className={`transition-transform duration-200 ${openDropdowns[item.label] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {/* 4. Mostra os sub-itens se o dropdown estiver aberto */}
                                    {openDropdowns[item.label] && (
                                        <div className="pl-6 mt-1 space-y-1">
                                            {item.children?.map(child => (
                                                <Link key={child.label} href={child.href || '#'} onClick={onClose} className="flex items-center gap-3 p-3 text-sm text-white transition-colors rounded-lg hover:bg-sky-600">
                                                    {child.icon}
                                                    <span>{child.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Se não for dropdown, renderiza como um link simples (comportamento antigo)
                                <Link href={item.href || '#'} onClick={item.onClick || onClose} className="flex items-center gap-3 p-3 font-semibold text-white transition-colors rounded-lg hover:bg-sky-600">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                    
                    {/* Botão de Logout fica no final */}
                    <button onClick={onLogout} className="flex items-center gap-3 p-3 mt-auto font-semibold text-white transition-colors rounded-lg bg-rose-600 hover:bg-rose-500">
                        <FiLogOut size={20} />
                        <span>Sair</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

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
            <div className="absolute right-0 z-20 w-56 p-2 mt-2 bg-white rounded-lg shadow-xl">
                <ul className="space-y-1">
                    {item.children?.map(child => (
                        <li key={child.label}>
                            <Link href={child.href || '#'} className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-md text-slate-700 hover:bg-slate-100">
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
        <header className="sticky top-0 z-30 shadow-md bg-sky-700">
            <nav className="container px-4 mx-auto">
                <div className='flex items-center justify-between py-3'>
                    <Link href="/" className='flex items-center gap-3' title='Página inicial'>
                        <Image src={Logo} alt="Logo IAD Eldorado Cantina" width={40} height={40} className="border-2 rounded-full border-sky-200" />
                        <span className='self-center hidden text-xl font-bold text-white whitespace-nowrap sm:block'>IAD Eldorado - Cantina</span>
                    </Link>

                    <div className='items-center hidden gap-2 lg:flex'>
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
                    
                    <button type='button' className='p-2 text-white lg:hidden' onClick={() => setIsMenuOpen(true)}>
                        <span className="sr-only">Abrir menu</span>
                        <FiMenu size={28} />
                    </button>
                </div>
            </nav>

            {isMenuOpen && <MobileNav items={visibleLinks} onClose={() => setIsMenuOpen(false)} onLogout={handleLogout}/>}
        </header>
    );
}