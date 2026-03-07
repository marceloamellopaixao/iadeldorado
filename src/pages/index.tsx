import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiCalendar, FiClock, FiInstagram, FiPause, FiPlay, FiRadio, FiSend, FiVolume2, FiYoutube } from "react-icons/fi";

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

export default function Home() {
  const zenoEmbedUrl = process.env.NEXT_PUBLIC_ZENOFM_EMBED_URL || "";
  const radioBannerUrl = process.env.NEXT_PUBLIC_RADIO_BANNER_URL || "/igreja.jpg";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);


  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleToggleRadio = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setVolume(clampedValue);
    if (!audioRef.current) return;
    audioRef.current.volume = clampedValue / 100;
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
          className="relative px-4 pb-24 overflow-hidden isolate pt-28 sm:px-6 lg:px-8"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(15,23,42,.78), rgba(15,23,42,.72)), url('/igreja.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-semibold text-[#f8edd3] backdrop-blur">
                Uma igreja para toda a família
              </p>
              <h1
                className="text-4xl font-extrabold leading-tight text-white text-balance sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bem-vindo à IAD Eldorado
              </h1>
              <p className="max-w-2xl mt-6 text-lg text-slate-100">
                Um ambiente acolhedor, de fé viva e comunhão real para você e sua família.
                Venha viver esse novo tempo conosco.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="#agenda"
                  className="rounded-full bg-[#f2c46d] px-6 py-3 text-sm font-bold text-[#1e293b] shadow-lg shadow-[#f2c46d]/30 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Ver Programação
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 text-sm font-bold text-white transition border rounded-full border-white/60 bg-white/5 backdrop-blur hover:bg-white/15"
                >
                  Abrir Cantina
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="midia" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
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
                  <div
                    className="relative w-full h-56 bg-center bg-cover sm:h-64"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(15,23,42,.78), rgba(15,23,42,.35)), url('${radioBannerUrl}')`,
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 p-5 sm:p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#f8edd3]">Rádio IAD Eldorado</p>

                      <div className="flex items-center w-full max-w-xl gap-4 p-4 border rounded-2xl border-white/20 bg-black/35 backdrop-blur">
                        <button
                          type="button"
                          onClick={handleToggleRadio}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2c46d] text-[#1f2937] transition hover:brightness-105"
                          aria-label={isPlaying ? "Pausar rádio" : "Tocar rádio"}
                        >
                          {isPlaying ? <FiPause className="text-lg" /> : <FiPlay className="ml-0.5 text-lg" />}
                        </button>

                        <div className="flex items-center flex-1 gap-2 text-white">
                          <FiVolume2 className="shrink-0" />
                          <button
                            type="button"
                            onClick={() => handleVolumeChange(volume - 10)}
                            className="px-2 py-1 text-xs font-bold text-white transition border rounded-md border-white/35 hover:bg-white/10"
                            aria-label="Diminuir volume"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={volume}
                            onChange={(event) => handleVolumeChange(Number(event.target.value))}
                            className="w-full h-2 cursor-pointer radio-volume-slider"
                            style={{ "--volume": `${volume}%` } as React.CSSProperties}
                            aria-label="Volume da rádio"
                          />
                          <button
                            type="button"
                            onClick={() => handleVolumeChange(volume + 10)}
                            className="px-2 py-1 text-xs font-bold text-white transition border rounded-md border-white/35 hover:bg-white/10"
                            aria-label="Aumentar volume"
                          >
                            +
                          </button>
                        </div>

                        <span className="min-w-[58px] text-right text-xs font-semibold text-[#f8edd3]">
                          {isPlaying ? "Ao vivo" : "Parado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={zenoEmbedUrl}
                    preload="none"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8c19e] bg-[#fffcf6] p-4 text-sm text-slate-600">
                  Configure em <span className="font-bold">NEXT_PUBLIC_ZENOFM_EMBED_URL</span> com a URL do stream.
                  Exemplo: <code>https://stream.zeno.fm/SEU-CODIGO</code>
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
              <div className="relative w-full bg-gray-200 h-96">
                <Image src="/Pastorado.jpeg" alt="Pastores" fill className="object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-extrabold text-[#0f172a]">Pr. Edison Xavier & Ev. Eliane Xavier</h3>
                <p className="mt-1 text-sm text-slate-600">Pastor e Evangelista</p>
                <div className="flex gap-2 mt-4">
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
          <div className="max-w-6xl mx-auto">
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

        

        <section id="pedido-oracao" className="bg-[#f8f2e6] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5e34]">Atendimento</p>
              <h2 className="mt-2 text-3xl font-bold text-[#0f172a] sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Pedido de Oração
              </h2>
              <p className="max-w-xl mt-4 text-slate-700">
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
        <div className="grid max-w-6xl gap-8 mx-auto md:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold">IAD Eldorado</h3>
            <p className="mt-3 text-slate-300">Rua Baiacu, 300 - Eldorado - Diadema/SP - CEP 09972-010</p>
            <p className="text-slate-300">E-mail: adeldoradosetor3@gmail.com</p>

            <Link href="#pedido-oracao" className="mt-5 inline-flex items-center rounded-full bg-[#f2c46d] px-5 py-2.5 text-sm font-bold text-[#111827]">
              Fazer Pedido de Oração
            </Link>
          </div>

          <div className="overflow-hidden border rounded-2xl border-white/20">
            <iframe
              className="h-full min-h-[220px] w-full"
              src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d6143.023468415731!2d-46.62867425775863!3d-23.723703952954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e3!4m0!4m5!1s0x94ce4431057996ff%3A0xc054b204a96989ca!2sAssembl%C3%A9ia%20de%20Deus%20-%20Jardim%20Eldorado%20-%20Diadema%20-%20SP%20-%20(Setor%203%20-%20Campo%20do%20Jabaquara)%20-%20R.%20Baiacu%2C%20300%20-%20Eldorado%2C%20Diadema%20-%20SP%2C%2009950-000!3m2!1d-23.723198099999998!2d-46.6252785!5e0!3m2!1spt-BR!2sbr!4v1694715620748!5m2!1spt-BR!2sbr"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa da Igreja"
            />
          </div>
        </div>

        <div className="max-w-6xl pt-6 mx-auto mt-10 text-sm text-center border-t border-white/15 text-slate-400">
          © {new Date().getFullYear()} IAD Eldorado. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}
