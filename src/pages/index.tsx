import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiInstagram, FiRadio, FiSend, FiYoutube } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { getTierBadgeText } from "@/utils/pricing";

const agendaItems = [
  {
    title: "Escola Bíblica Dominical",
    date: "Domingo",
    time: "09h00",
    description: "Aprendizado da Palavra para toda a família.",
  },
  {
    title: "Culto da Família",
    date: "Domingo",
    time: "18h00",
    description: "Louvor, comunhão e palavra transformadora.",
  },
  {
    title: "Culto de Ensino",
    date: "Terça-feira",
    time: "19h30",
    description: "Aprofundamento bíblico com aplicação prática.",
  },
  {
    title: "Culto por Departamentos",
    date: "Quinta-feira",
    time: "19h30",
    description: "Desenvolvimento espiritual por departamentos (jovens, irmãs e varões).",
  },
  {
    title: "Santa Ceia",
    date: "Mensal",
    time: "18h00",
    description: "Noite especial com adoração e palavra.",
  },
  {
    title: "Ação Social",
    date: "Programação Especial",
    time: "09h00",
    description: "Cuidado e apoio às famílias da comunidade.",
  },
];

const normalizeCategory = (category?: string) =>
  (category || "geral")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const categoryLabel = (category: string) =>
  category
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function Home() {
  const { products, loading: cantinaLoading } = useProducts();
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("todas");
  const zenoEmbedUrl = process.env.NEXT_PUBLIC_ZENOFM_EMBED_URL || "";

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((item) => normalizeCategory(item.category))));
    return ["todas", ...uniqueCategories];
  }, [products]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("todas");
    }
  }, [categories, activeCategory]);

  const filteredCantinaItems = useMemo(
    () =>
      products.filter((item) =>
        activeCategory === "todas" ? true : normalizeCategory(item.category) === activeCategory,
      ),
    [products, activeCategory],
  );

  const handleBuyFromHome = async (item: (typeof products)[number]) => {
    if (item.stock <= 0) return;
    await addToCart(item, 1);
    router.push("/checkout");
  };

  return (
    <>
      <Head>
        <title>IAD Eldorado | Igreja e Cantina</title>
        <meta
          name="description"
          content="Landing page oficial da IAD Eldorado com agenda, web rádio, contato, pedido de oração e cantina da igreja."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="bg-[#fcfbf7] text-[#1f2937]">
        <section
          id="inicio"
          className="relative isolate overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(15,23,42,.78), rgba(15,23,42,.72)), url('/igreja.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-semibold text-[#f8edd3] backdrop-blur">
                Uma igreja para toda a família
              </p>
              <h1
                className="text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bem-vindo à IAD Eldorado
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-100">
                Um ambiente acolhedor, de fé viva e comunhão real para você e sua família.
                Venha viver esse novo tempo conosco.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#agenda"
                  className="rounded-full bg-[#f2c46d] px-6 py-3 text-sm font-bold text-[#1e293b] shadow-lg shadow-[#f2c46d]/30 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Ver Programação
                </Link>
                <Link
                  href="/products"
                  className="rounded-full border border-white/60 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Abrir Cantina
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="midia" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Web Rádio</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f172a] sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Ouça nossa rádio em tempo real
              </h2>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[#eadfca] bg-white p-6 shadow-xl sm:p-8">
              <div className="mb-4 inline-flex items-center rounded-full bg-[#f8f2e6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8b5e34]">
                <FiRadio className="mr-2" /> Ao vivo
              </div>

              {zenoEmbedUrl ? (
                <div className="overflow-hidden rounded-2xl border border-[#eadfca] bg-[#fffcf6]">
                  <iframe
                    src={zenoEmbedUrl}
                    width="100%"
                    height="160"
                    frameBorder="0"
                    allow="autoplay"
                    loading="lazy"
                    title="Player Web Rádio ZenoFM"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8c19e] bg-[#fffcf6] p-4 text-sm text-slate-600">
                  Configure em <span className="font-bold">NEXT_PUBLIC_ZENOFM_EMBED_URL</span>.
                  Exemplo: <code>https://zeno.fm/embed/SEU-CODIGO</code>
                </div>
              )}

              <p className="mt-4 text-sm text-slate-600">Louvores, palavra e avisos da igreja durante a semana.</p>
            </div>
          </div>
        </section>

        <section id="sobre" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <article>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Nossa História</p>
              <h2
                className="mt-3 text-3xl font-bold text-[#0f172a] sm:text-4xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Fé, serviço e amor por pessoas
              </h2>
              <p className="mt-5 leading-8 text-slate-700">
                A IAD Eldorado nasceu com o propósito de anunciar o evangelho de forma viva,
                cuidar de famílias e servir à comunidade. Somos uma igreja que acolhe, discipula
                e envia pessoas para viverem o chamado de Deus.
              </p>
            </article>

            <div className="overflow-hidden rounded-3xl border border-[#eadfca] bg-white shadow-xl">
              <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: "url('/pastor_pastora.jpg')" }} />
              <div className="p-6">
                <h3 className="text-lg font-extrabold text-[#0f172a]">Pr. Edison Xavier & Ev. Eliane Ferreira</h3>
                <p className="mt-1 text-sm text-slate-600">Pastor e Evangelista</p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href="https://www.instagram.com/iad_eldorado_/"
                    target="_blank"
                    className="rounded-full border border-[#eadfca] p-2 text-[#5f3711] transition hover:bg-[#f9f3e7]"
                  >
                    <FiInstagram />
                  </Link>
                  <Link
                    href="https://www.youtube.com/@adeldoradosetor3"
                    target="_blank"
                    className="rounded-full border border-[#eadfca] p-2 text-[#5f3711] transition hover:bg-[#f9f3e7]"
                  >
                    <FiYoutube />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="agenda" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Agenda e Eventos</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f172a] sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Programação da Igreja
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agendaItems.map((item) => (
                <article key={item.title} className="group rounded-2xl border border-[#eadfca] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-3 inline-flex items-center rounded-full bg-[#f8f2e6] px-3 py-1 text-xs font-bold text-[#8b5e34]">
                    <FiCalendar className="mr-1.5" /> {item.date}
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0f172a]">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  <p className="mt-4 inline-flex items-center text-sm font-semibold text-[#5f3711]">
                    <FiClock className="mr-1.5" /> {item.time}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cantina" className="bg-[#f8f2e6] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Destaque Especial</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f172a] sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                IAD Eldorado - Cantina
              </h2>
              <p className="mt-4 max-w-3xl text-slate-700">
                Toda arrecadação da cantina é revertida para projetos da igreja, missão e apoio
                à obra de Deus. Consuma com alegria e participe desse propósito.
              </p>
              <Link href="/products" className="mt-5 inline-flex rounded-full bg-[#5f3711] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4a2b0d]">
                Ir para a página da cantina
              </Link>
            </div>

            <div className="rounded-3xl border border-[#e7d8be] bg-white p-6 shadow-xl">
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((tab) => {
                  const isActive = activeCategory === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCategory(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? "bg-[#5f3711] text-white shadow-md" : "border border-[#eadfca] bg-[#fcfbf7] text-[#5f3711] hover:bg-[#f7f1e5]"}`}
                    >
                      {tab === "todas" ? "Todas" : categoryLabel(tab)}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cantinaLoading && (
                  <div className="col-span-full rounded-2xl border border-[#eadfca] bg-[#fffcf6] p-4 text-sm text-slate-600">
                    Carregando itens da cantina...
                  </div>
                )}

                {!cantinaLoading && filteredCantinaItems.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-[#eadfca] bg-[#fffcf6] p-4 text-sm text-slate-600">
                    Nenhum produto disponível nesta categoria no momento.
                  </div>
                )}

                {!cantinaLoading &&
                  filteredCantinaItems.map((item) => (
                    <article
                      key={item.id}
                      className="flex h-full min-h-[230px] flex-col rounded-2xl border border-[#eadfca] bg-[#fffcf6] p-4 transition hover:shadow-md"
                    >
                      <div className="mb-3 flex min-h-[56px] items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#e7d8be] bg-[#e8d3af]">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] font-extrabold text-[#5f3711]">FOTO</div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#0f172a]">{item.name}</h3>
                          <span className="mt-1 inline-block rounded-full bg-[#f2c46d]/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8b5e34]">
                            Estoque: {item.stock}
                          </span>
                        </div>
                      </div>
                      <p className="min-h-[44px] text-sm text-slate-600">{item.description || "Sem descrição."}</p>
                      {(item.pricingTiers || []).length > 0 && (
                        <p className="mt-2 min-h-[18px] text-xs font-bold text-[#8b5e34]">
                          Oferta: {(item.pricingTiers || []).map(getTierBadgeText).join(" | ")}
                        </p>
                      )}
                      {(item.pricingTiers || []).length === 0 && <div className="mt-2 min-h-[18px]" />}
                      <p className="mt-2 min-h-[24px] text-sm font-extrabold text-[#5f3711]">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleBuyFromHome(item)}
                        disabled={item.stock <= 0}
                        className={`mt-auto w-full rounded-full px-4 py-2 text-sm font-bold transition ${
                          item.stock <= 0
                            ? "cursor-not-allowed bg-[#d4c098] text-[#5f3711]/70"
                            : "bg-[#5f3711] text-white hover:bg-[#4a2b0d]"
                        }`}
                      >
                        {item.stock <= 0 ? "Indisponível" : "Comprar"}
                      </button>
                    </article>
                  ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#eadfca] bg-[#f8f2e6] p-4 text-sm text-[#5f3711]">
                <p className="font-bold">Horário de funcionamento</p>
                <p>Aberta antes e depois dos cultos.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pedido-oracao" className="bg-[#f8f2e6] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Atendimento</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f172a] sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Pedido de Oração
              </h2>
              <p className="mt-4 max-w-xl text-slate-700">
                Envie seu pedido. Nossa equipe pastoral vai orar por você e por sua família com carinho e sigilo.
              </p>
            </div>

            <form action="https://formsubmit.co/adeldoradosetor3@gmail.com" method="POST" className="rounded-3xl border border-[#eadfca] bg-white p-6 shadow-xl">
              <input type="hidden" name="_subject" value="Novo Pedido de Oração - Site IAD Eldorado" />
              <input type="hidden" name="_captcha" value="false" />
              <div className="grid gap-4">
                <input required name="nome" placeholder="Seu nome" className="w-full rounded-xl border border-[#eadfca] bg-[#fffcf6] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#5f3711]" />
                <input name="telefone" placeholder="Telefone (opcional)" className="w-full rounded-xl border border-[#eadfca] bg-[#fffcf6] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#5f3711]" />
                <textarea required name="pedido" rows={5} placeholder="Escreva seu pedido de oração" className="w-full rounded-xl border border-[#eadfca] bg-[#fffcf6] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#5f3711]" />
                <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[#5f3711] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4a2b0d]">
                  <FiSend className="mr-2" /> Enviar pedido
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer id="contato" className="bg-[#111827] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold">IAD Eldorado</h3>
            <p className="mt-3 text-slate-300">Rua Baiacu, 300 - Eldorado - Diadema/SP - CEP 09972-010</p>
            <p className="text-slate-300">E-mail: adeldoradosetor3@gmail.com</p>

            <Link href="#pedido-oracao" className="mt-5 inline-flex items-center rounded-full bg-[#f2c46d] px-5 py-2.5 text-sm font-bold text-[#111827]">
              Fazer Pedido de Oração
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/20">
            <iframe
              className="h-full min-h-[220px] w-full"
              src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d6143.023468415731!2d-46.62867425775863!3d-23.723703952954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e3!4m0!4m5!1s0x94ce4431057996ff%3A0xc054b204a96989ca!2sAssembl%C3%A9ia%20de%20Deus%20-%20Jardim%20Eldorado%20-%20Diadema%20-%20SP%20-%20(Setor%203%20-%20Campo%20do%20Jabaquara)%20-%20R.%20Baiacu%2C%20300%20-%20Eldorado%2C%20Diadema%20-%20SP%2C%2009950-000!3m2!1d-23.723198099999998!2d-46.6252785!5e0!3m2!1spt-BR!2sbr!4v1694715620748!5m2!1spt-BR!2sbr"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa da Igreja"
            />
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-white/15 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} IAD Eldorado. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}
