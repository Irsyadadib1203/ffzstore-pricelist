import { Suspense } from "react";

// ─── Types (sesuai respons API ffzstore) ─────────────────────────────────────

interface Product {
  product_id: string;
  product_name: string;
  product_code: string;
  product_price: number;
  is_active: boolean;
  category_type: string;
  category_title: string;
  category_subtitle: string | null;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<Product[]> {
  const apiKey = process.env.FFZSTORE_API_KEY;

  // Jangan fetch jika API key belum dikonfigurasi
  if (!apiKey || apiKey === "your_api_key_here") return [];

  const baseUrl = "https://api.ffzstore.com";

  try {
    const res = await fetch(`${baseUrl}/v1/products`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status, await res.text());
      return [];
    }

    const json = await res.json();
    // Respons: { statusCode, message, data: [...] }
    return Array.isArray(json) ? json : (json.data ?? []);
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Components ───────────────────────────────────────────────────────────────

function CategoryTable({
  categoryName,
  products,
}: {
  categoryName: string;
  products: Product[];
}) {
  return (
    <div className="mb-8 overflow-x-auto shadow-sm">
      <table className="w-full text-sm border-collapse">
        {/* Category Header */}
        <thead>
          <tr>
            <th
              colSpan={4}
              className="text-center text-white py-2 px-4 font-semibold text-base tracking-wide"
              style={{ backgroundColor: "#5b8fa8" }}
            >
              {categoryName}
            </th>
          </tr>
          {/* Column Headers */}
          <tr style={{ backgroundColor: "#4a7a9b" }}>
            <th className="text-center text-white py-2 px-4 font-medium w-1/5 border border-blue-300/30">
              Kode
            </th>
            <th className="text-center text-white py-2 px-4 font-medium border border-blue-300/30">
              Keterangan
            </th>
            <th className="text-center text-white py-2 px-4 font-medium w-1/5 border border-blue-300/30">
              Harga
            </th>
            <th className="text-center text-white py-2 px-4 font-medium w-1/6 border border-blue-300/30">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="text-center py-4 text-gray-500 bg-white border border-gray-200"
              >
                Tidak ada produk
              </td>
            </tr>
          ) : (
            products.map((product, idx) => (
              <tr
                key={product.product_id ?? idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
              >
                {/* Kode */}
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.product_code ?? "-"}
                </td>
                {/* Keterangan: nama produk, tampilkan subtitle jika ada */}
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.product_name ?? "-"}
                  {product.category_subtitle && (
                    <span className="text-gray-400 ml-1 text-xs">
                      ({product.category_subtitle})
                    </span>
                  )}
                </td>
                {/* Harga */}
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.product_price != null
                    ? formatRupiah(product.product_price)
                    : "-"}
                </td>
                {/* Status berdasarkan is_active (boolean) */}
                <td
                  className={`text-center py-2 px-4 border border-gray-200/70 font-semibold ${
                    product.is_active ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {product.is_active ? "Open" : "Closed"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-6">
      <strong>Error:</strong> {message}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

async function PricelistContent() {
  const products = await fetchProducts();

  const apiKey = process.env.FFZSTORE_API_KEY;
  const isKeyMissing = !apiKey || apiKey === "your_api_key_here";

  // Group by category_title (sudah tersedia langsung di tiap produk)
  const grouped: Record<string, { subtitle: string | null; products: Product[] }> = {};

  for (const product of products) {
    const key = product.category_title ?? "Lainnya";
    if (!grouped[key]) {
      grouped[key] = { subtitle: product.category_subtitle, products: [] };
    }
    grouped[key].products.push(product);
  }

  // Urutkan kategori secara alfabetis
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b, "id")
  );

  const totalProducts = products.length;
  const totalCategories = sortedGroups.length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1
          className="text-3xl font-bold text-white py-4 px-8 rounded-lg inline-block"
          style={{ backgroundColor: "#4a7a9b" }}
        >
          Daftar Harga FFZ Store
        </h1>
        <p className="text-gray-500 mt-3 text-sm">
          Terakhir diperbarui: {new Date().toLocaleString("id-ID")} &mdash;{" "}
          {totalProducts} produk dari {totalCategories} kategori
        </p>
      </div>

      {/* Warnings */}
      {isKeyMissing && (
        <ErrorBanner message="API Key belum dikonfigurasi. Isi FFZSTORE_API_KEY di file .env.local lalu restart server." />
      )}
      {!isKeyMissing && products.length === 0 && (
        <ErrorBanner message="Tidak ada data produk. Periksa API Key dan koneksi ke api.ffzstore.com." />
      )}

      {/* Tables per category */}
      {sortedGroups.map(([categoryName, group]) => (
        <CategoryTable
          key={categoryName}
          categoryName={categoryName}
          products={group.products}
        />
      ))}

      {sortedGroups.length === 0 && !isKeyMissing && (
        <div className="text-center text-gray-500 py-20 text-lg">
          Tidak ada kategori atau produk yang ditemukan.
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs mt-10 pb-4">
        &copy; {new Date().getFullYear()} FFZ Store &mdash; Harga dapat berubah
        sewaktu-waktu
      </footer>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
          Memuat data produk...
        </div>
      }
    >
      <PricelistContent />
    </Suspense>
  );
}
