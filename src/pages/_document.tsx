import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="pt-BR">
            <Head>
                <meta charSet="UTF-8" />
                {/* Cor do tema atualizada para o nosso azul (sky-600) */}
                <meta name="theme-color" content="#f1f5f9" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="icon" href="/logo-adeldorado.png" />
            </Head>
            <body className="bg-slate-100">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}