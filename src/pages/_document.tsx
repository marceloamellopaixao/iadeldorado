import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="pt-BR">
            <Head>
                <meta charSet="UTF-8" />
                <meta name="theme-color" content="#f7f6e4" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" href="/logo-adeldorado.png" />
            </Head>
            <body className="bg-slate-100">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
