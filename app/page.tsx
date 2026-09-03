import { Suspense } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  code: string;
  name: string;
  price: number;
  status: string;
  category_id?: string | number;
  category?: string;
  [key: string]: unknown;
}

interface Category {
  id: string | number;
  name: string;
  [key: string]: unknown;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchProducts(): Promise<Product[]> {
  const apiKey = process.env.FFZSTORE_API_KEY;
  const baseUrl = process.env.FFZSTORE_BASE_URL ?? "https://api.ffzstore.com";

  const res = await fetch(`${baseUrl}/v1/products`, {
    headers: { Authorization: apiKey ?? "" },
    next: { revalidate: 300 }, // cache 5 minutes
  });

  if (!res.ok) {
    console.error("Failed to fetch products:", res.status, await res.text());
    return [];
  }

  const json = await res.json();
  // API might return { data: [...] } or directly an array
  return Array.isArray(json) ? json : (json.data ?? json.products ?? []);
}

async function fetchCategories(): Promise<Category[]> {
  const apiKey = process.env.FFZSTORE_API_KEY;
  const baseUrl = process.env.FFZSTORE_BASE_URL ?? "https://api.ffzstore.com";

  const res = await fetch(`${baseUrl}/v1/category`, {
    headers: { Authorization: apiKey ?? "" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.error("Failed to fetch categories:", res.status, await res.text());
    return [];
  }

  const json = await res.json();
  return Array.isArray(json) ? json : (json.data ?? json.categories ?? []);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusStyle(status: string): string {
  const s = status?.toLowerCase() ?? "";
  if (s === "open" || s === "active" || s === "available") {
    return "text-green-500 font-semibold";
  }
  if (s === "closed" || s === "inactive" || s === "unavailable") {
    return "text-red-500 font-semibold";
  }
  return "text-yellow-500 font-semibold";
}

function getStatusLabel(status: string): string {
  const s = status?.toLowerCase() ?? "";
  if (s === "open" || s === "active" || s === "available") return "Open";
  if (s === "closed" || s === "inactive" || s === "unavailable") return "Closed";
  return status ?? "-";
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
                key={product.code ?? idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
              >
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.code ?? "-"}
                </td>
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.name ?? "-"}
                </td>
                <td className="text-center py-2 px-4 border border-gray-200/70 text-gray-700">
                  {product.price != null ? formatRupiah(product.price) : "-"}
                </td>
                <td
                  className={`text-center py-2 px-4 border border-gray-200/70 ${getStatusStyle(
                    product.status ?? ""
                  )}`}
                >
                  {getStatusLabel(product.status ?? "")}
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
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const apiKey = process.env.FFZSTORE_API_KEY;
  const isKeyMissing = !apiKey || apiKey === "your_api_key_here";

  // Group products by category
  type GroupMap = Record<string, { name: string; products: Product[] }>;

  const grouped: GroupMap = {};

  // First, build groups from categories
  for (const cat of categories) {
    const key = String(cat.id);
    grouped[key] = { name: cat.name, products: [] };
  }

  // Then, assign products to their category groups
  for (const product of products) {
    // Try different possible field names for category reference
    const catId =
      product.category_id ??
      (product.category as string | number | undefined) ??
      "uncategorized";
    const key = String(catId);

    if (!grouped[key]) {
      // Category not in the categories list — create on-the-fly
      grouped[key] = {
        name:
          typeof product.category === "string"
            ? product.category
            : `Kategori ${key}`,
        products: [],
      };
    }
    grouped[key].products.push(product);
  }

  // Filter out empty categories (unless all are empty, keep them for display)
  const nonEmptyGroups = Object.entries(grouped).filter(
    ([, v]) => v.products.length > 0
  );
  const displayGroups =
    nonEmptyGroups.length > 0 ? nonEmptyGroups : Object.entries(grouped);

  const totalProducts = products.length;

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
          {totalProducts} produk dari {displayGroups.length} kategori
        </p>
      </div>

      {/* Warnings */}
      {isKeyMissing && (
        <ErrorBanner message='API Key belum dikonfigurasi. Isi FFZSTORE_API_KEY di file .env.local lalu restart server.' />
      )}
      {!isKeyMissing && products.length === 0 && (
        <ErrorBanner message="Tidak ada data produk yang berhasil dimuat. Periksa API Key dan koneksi ke api.ffzstore.com." />
      )}

      {/* Tables per category */}
      {displayGroups.map(([key, group]) => (
        <CategoryTable
          key={key}
          categoryName={group.name}
          products={group.products}
        />
      ))}

      {displayGroups.length === 0 && !isKeyMissing && (
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
