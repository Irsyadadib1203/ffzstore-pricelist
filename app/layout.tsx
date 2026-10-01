import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FFZ Store - Daftar Harga',
  description: 'Daftar harga lengkap produk FFZ Store',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}