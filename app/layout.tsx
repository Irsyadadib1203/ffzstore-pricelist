import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FFZ Store - Daftar Harga',
  description: 'Daftar harga lengkap produk FFZ Store',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
