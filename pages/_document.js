import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon & Touch Icons */}
        <link rel="icon" type="image/svg+xml" href="/Logo.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Logo1.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/Logo.png" />

        {/* Global Web Fonts & Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
