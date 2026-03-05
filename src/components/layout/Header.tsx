import { useState } from "react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import {
  FiBox,
  FiChevronDown,
  FiClipboard,
  FiDollarSign,
  FiFileText,
  FiGlobe,
  FiList,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShoppingCart,
  FiUser,
  FiUserPlus,
  FiX,
  FiYoutube,
} from "react-icons/fi";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useDropdownClose } from "@/hooks/useDropdownClose";
import Logo from "@/assets/images/logo-adeldorado.png";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  isDropdown?: boolean;
  children?: NavItem[];
  allowedRoles: ("admin" | "seller" | "customer" | "guest")[];
}

interface HomeNavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  items: NavItem[];
  onClose: () => void;
  onLogout: () => void;
  showLogout: boolean;
}

interface HomeMobileNavProps {
  items: HomeNavItem[];
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ items, onClose, onLogout, showLogout }) => {
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [label]: !prevState[label],
    }));
  };

  return (
    <div className="fixed inset-0 z-[90] flex bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <div
        className="flex h-screen w-[82%] max-w-sm flex-col bg-[#fffdf7] p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <Link href="/" onClick={onClose} className="flex items-center gap-3">
            <Image
              src={Logo}
              alt="Logo IAD Eldorado"
              width={40}
              height={40}
              className="rounded-full border border-[#d8c19e]"
            />
            <span className="text-sm font-bold uppercase tracking-wide text-[#0f172a]">
              IAD Eldorado
            </span>
          </Link>
          <button onClick={onClose} className="p-2 text-[#0f172a]">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col flex-grow gap-2 overflow-y-auto">
          {items.map((item) => (
            <div key={item.label}>
              {item.isDropdown ? (
                <>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg p-3 text-sm font-bold uppercase tracking-[0.08em] text-[#0f172a] transition-colors hover:bg-[#f4ecdd]"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <FiChevronDown
                      className={`transition-transform duration-200 ${
                        openDropdowns[item.label] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdowns[item.label] && (
                    <div className="pl-6 mt-1 space-y-1">
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href || "#"}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-lg p-3 text-xs font-bold uppercase tracking-[0.08em] text-[#1f2937] transition-colors hover:bg-[#f4ecdd]"
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href || "#"}
                  onClick={item.onClick || onClose}
                  className="flex items-center gap-3 rounded-lg p-3 text-sm font-bold uppercase tracking-[0.08em] text-[#0f172a] transition-colors hover:bg-[#f4ecdd]"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}

          {showLogout && (
            <button
              onClick={onLogout}
              className="mt-auto flex items-center gap-3 rounded-full bg-[#5f3711] p-3 font-semibold text-white transition-colors hover:bg-[#4b2b0e]"
            >
              <FiLogOut size={20} />
              <span>Sair</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

const HomeMobileNav: React.FC<HomeMobileNavProps> = ({ items, onClose }) => (
  <div className="fixed inset-0 z-[90] flex bg-black/40 backdrop-blur-sm lg:hidden" onClick={onClose}>
    <div
      className="flex h-screen w-[82%] max-w-sm flex-col bg-[#fffdf7] p-4 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <Link href="/#inicio" onClick={onClose} className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Logo IAD Eldorado"
            width={40}
            height={40}
            className="rounded-full border border-[#d8c19e]"
          />
          <span className="text-sm font-bold uppercase tracking-wide text-[#0f172a]">IAD Eldorado</span>
        </Link>
        <button onClick={onClose} className="p-2 text-[#0f172a]">
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex flex-col flex-grow gap-2 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="rounded-lg p-3 text-sm font-bold uppercase tracking-[0.08em] text-[#0f172a] transition-colors hover:bg-[#f4ecdd]"
          >
            {item.label}
          </Link>
        ))}

        <Link
          href="https://www.youtube.com/@adeldoradosetor3"
          target="_blank"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#5f3711] px-4 py-3 text-sm font-bold text-white"
        >
          <FiYoutube /> Culto Ao Vivo
        </Link>
      </nav>
    </div>
  </div>
);

interface DesktopDropdownProps {
  item: NavItem;
  dropdownStates: { [key: string]: boolean };
  setDropdownRef: (key: string, element: HTMLDivElement | null) => void;
  toggleDropdown: (key: string) => void;
}

const DesktopDropdown: React.FC<DesktopDropdownProps> = ({
  item,
  dropdownStates,
  setDropdownRef,
  toggleDropdown,
}) => (
  <div className="relative" ref={(element) => setDropdownRef(item.label, element)}>
    <button
      onClick={() => toggleDropdown(item.label)}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f172a] transition-colors duration-300 hover:bg-[#f4ecdd]"
    >
      {item.icon}
      <span>{item.label}</span>
      <FiChevronDown
        className={`transition-transform duration-200 ${dropdownStates[item.label] ? "rotate-180" : ""}`}
      />
    </button>

    {dropdownStates[item.label] && (
      <div className="absolute right-0 z-20 w-56 p-2 mt-2 bg-white rounded-lg shadow-xl">
        <ul className="space-y-1">
          {item.children?.map((child) => (
            <li key={child.label}>
              <Link
                href={child.href || "#"}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#1f2937] transition-colors hover:bg-[#f4ecdd]"
              >
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

  const isHomePage = router.pathname === "/";

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  const homeNavLinks: HomeNavItem[] = [
    { label: "Início", href: "/#inicio" },
    { label: "Sobre", href: "/#sobre" },
    { label: "Agenda", href: "/#agenda" },
    { label: "Cantina", href: "/#cantina" },
    { label: "Contato", href: "/#contato" },
  ];

  const allNavLinks: NavItem[] = [
    {
      label: "Início Igreja",
      href: "/",
      icon: <FiGlobe size={20} />,
      allowedRoles: ["admin", "seller", "customer", "guest"],
    },
    {
      label: "Produtos",
      isDropdown: true,
      icon: <FiBox size={20} />,
      allowedRoles: ["admin", "seller"],
      children: [
        {
          label: "Ver Vitrine",
          href: "/products",
          icon: <FiShoppingCart size={20} />,
          allowedRoles: ["admin", "seller"],
        },
        {
          label: "Gerenciar Produtos",
          href: "/admin/products",
          icon: <FiClipboard size={20} />,
          allowedRoles: ["admin", "seller"],
        },
      ],
    },
    {
      label: "Produtos",
      href: "/products",
      icon: <FiBox size={20} />,
      allowedRoles: ["customer", "guest"],
    },
    {
      label: "Vendas",
      isDropdown: true,
      icon: <FiDollarSign size={20} />,
      allowedRoles: ["admin", "seller"],
      children: [
        {
          label: "Gerenciar Pedidos",
          href: "/seller/orders",
          icon: <FiList size={20} />,
          allowedRoles: ["admin", "seller"],
        },
        {
          label: "Relatório de Vendas",
          href: "/seller/report",
          icon: <FiFileText size={20} />,
          allowedRoles: ["admin", "seller"],
        },
      ],
    },
    {
      label: "Meus Dados",
      isDropdown: true,
      icon: <FiUser size={20} />,
      allowedRoles: ["admin", "seller", "customer"],
      children: [
        {
          label: "Meu Perfil",
          href: "/auth/profile",
          icon: <FiUser size={20} />,
          allowedRoles: ["admin", "seller", "customer"],
        },
        {
          label: "Histórico de Pedidos",
          href: "/customer/orders",
          icon: <FiList size={20} />,
          allowedRoles: ["admin", "seller", "customer"],
        },
      ],
    },
    {
      label: "Histórico de Pedidos",
      href: "/customer/orders",
      icon: <FiList size={20} />,
      allowedRoles: ["guest"],
    },
    {
      label: "Administração",
      isDropdown: true,
      icon: <FiSettings size={20} />,
      allowedRoles: ["admin"],
      children: [
        {
          label: "Gerenciar Usuários",
          href: "/admin/users",
          icon: <FiUser size={20} />,
          allowedRoles: ["admin"],
        },
        {
          label: "Configurações PIX",
          href: "/admin/pix-config",
          icon: <FiDollarSign size={20} />,
          allowedRoles: ["admin"],
        },
      ],
    },
    {
      label: "Login",
      href: "/auth/login",
      icon: <FiLogIn size={20} />,
      allowedRoles: ["guest"],
    },
    {
      label: "Criar Conta",
      href: "/auth/register",
      icon: <FiUserPlus size={20} />,
      allowedRoles: ["guest"],
    },
  ];

  const userRole = userData?.role || "guest";
  const visibleLinks = allNavLinks.filter((link) => link.allowedRoles.includes(userRole));

  if (isHomePage) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <nav className="container px-4 mx-auto">
          <div className="flex items-center justify-between py-3">
            <Link href="/#inicio" className="flex items-center gap-3" title="Página inicial">
              <Image
                src={Logo}
                alt="Logo IAD Eldorado"
                width={42}
                height={42}
                className="border rounded-full border-[#d8c19e]"
              />
              <span className="hidden text-sm font-extrabold tracking-wide text-[#0f172a] uppercase sm:block">
                IAD Eldorado
              </span>
            </Link>

            <div className="items-center hidden gap-1 lg:flex">
              {homeNavLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-xs font-bold tracking-[0.12em] text-[#0f172a] uppercase transition-colors rounded-md hover:bg-[#f4ecdd]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="https://www.youtube.com/@adeldoradosetor3"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 ml-2 text-xs font-bold tracking-wide text-white uppercase transition rounded-full bg-[#5f3711] hover:bg-[#4b2b0e]"
              >
                <FiYoutube />
                Culto Ao Vivo
              </Link>
            </div>

            {!isMenuOpen && (
              <button
                type="button"
                className="p-2 text-[#0f172a] lg:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <FiMenu size={28} />
              </button>
            )}
          </div>
        </nav>

        {isMenuOpen && <HomeMobileNav items={homeNavLinks} onClose={() => setIsMenuOpen(false)} />}
      </header>
    );
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <nav className="container px-4 mx-auto">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3" title="Página inicial">
            <Image
              src={Logo}
              alt="Logo IAD Eldorado Cantina"
              width={40}
              height={40}
              className="border-2 rounded-full border-[#d8c19e]"
            />
            <span className="hidden whitespace-nowrap text-sm font-extrabold uppercase tracking-wide text-[#0f172a] sm:block">
              IAD Eldorado
            </span>
          </Link>

          <div className="items-center hidden gap-2 lg:flex">
            {visibleLinks.map((item) =>
              item.isDropdown ? (
                <DesktopDropdown
                  key={item.label}
                  item={item}
                  dropdownStates={dropdownStates}
                  setDropdownRef={setDropdownRef}
                  toggleDropdown={toggleDropdown}
                />
              ) : (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0f172a] transition-colors duration-300 hover:bg-[#f4ecdd]"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ),
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 ml-4 font-semibold text-white transition-colors duration-300 rounded-full bg-[#5f3711] hover:bg-[#4b2b0e]"
              >
                <FiLogOut size={20} />
                <span>Sair</span>
              </button>
            )}
          </div>

          {!isMenuOpen && (
            <button
              type="button"
              className="p-2 text-[#0f172a] lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <FiMenu size={28} />
            </button>
          )}
        </div>
      </nav>

      {isMenuOpen && (
        <MobileNav
          items={visibleLinks}
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
          showLogout={Boolean(user)}
        />
      )}
    </header>
  );
}
