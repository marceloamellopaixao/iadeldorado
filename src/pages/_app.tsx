import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </AuthProvider>
  );
}