import React from "react";
import Image from "next/image";
import Logo from "@/assets/images/logo-adeldorado.png";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-82px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#dfcfb0] bg-[#fffdf7] shadow-[0_22px_60px_rgba(95,55,17,0.16)]">
        <div className="bg-gradient-to-r from-[#5f3711] to-[#8b5e34] p-6 text-center">
          <Image
            src={Logo}
            alt="Logo IAD Eldorado Cantina"
            width={66}
            height={66}
            className="mx-auto rounded-full border-2 border-[#e8d3af] bg-white p-1"
          />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f8edd3]">Cantina Digital</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  );
}
