import { useRouter } from "next/router";
import Header from "./Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isHomePage = router.pathname === "/";

  return (
    <div className={`flex min-h-screen flex-col ${isHomePage ? "bg-[#fcfbf7]" : "cantina-surface-bg"}`}>
      <Header />
      <main className={`flex-grow ${isHomePage ? "" : "cantina-page-wrap pt-24"}`}>{children}</main>
    </div>
  );
}
