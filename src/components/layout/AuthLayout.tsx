import React from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/logo-adeldorado.png';

interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <div className="flex items-center justify-center h-full p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
                <Image 
                    src={Logo} 
                    alt="Logo IAD Eldorado Cantina" 
                    width={60} 
                    height={60} 
                    className="mx-auto mb-4 rounded-full"
                />
                <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">
                    {title}
                </h1>
                {children}
            </div>
        </div>
    );
}