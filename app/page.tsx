"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  product_id: string;
  product_name: string;
  product_sub_name: string;
  product_code: string;
  product_price: number;
  is_active: boolean;
  category_type: string;
  category_title: string;
  category_subtitle: string | null;
}

interface ApiResponse {
  data: Product[];
  error?: string;
  timestamp?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDescription(product: Product): string {
  let name = (product.product_name || "").trim();
  // Hapus tanda kurung kosong seperti " ()" atau "()"
  name = name.replace(/\s*\(\s*\)/g, "").trim();

  const subName = (product.product_sub_name || "").trim();
  if (
    subName &&
    subName.length > 0 &&
    !name.toLowerCase().includes(subName.toLowerCase())
  ) {
    name = `${name} (${subName})`;
  }
  return name;
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
    <div className="w-full mb-8 overflow-hidden rounded-md border border-[#9abecf] shadow-sm bg-white">
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-sm">
          <thead>
            {/* Header Kategori */}
            <tr>
              <th
                colSpan={4}
                className="text-center text-white py-2.5 px-4 font-bold text-base sm:text-lg tracking-wide select-none"
                style={{ backgroundColor: "#5087a2" }}
              >
                {categoryName}
              </th>
            </tr>
            {/* Kolom Header */}
            <tr style={{ backgroundColor: "#427690" }}>
              <th className="text-center text-white py-2 px-3 font-semibold w-[22%] sm:w-[20%] border-r border-t border-[#6ca1ba]">
                Kode
              </th>
              <th className="text-center text-white py-2 px-3 font-semibold w-[42%] sm:w-[45%] border-r border-t border-[#6ca1ba]">
                Keterangan
              </th>
              <th className="text-center text-white py-2 px-3 font-semibold w-[22%] sm:w-[20%] border-r border-t border-[#6ca1ba]">
                Harga
              </th>
              <th className="text-center text-white py-2 px-3 font-semibold w-[14%] sm:w-[15%] border-t border-[#6ca1ba]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-500 bg-white"
                >
                  Tidak ada produk dalam kategori ini
                </td>
              </tr>
            ) : (
              products.map((product, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={product.product_id || product.product_code || idx}
                    className={`transition-colors hover:bg-[#e0eff7] ${
                      isEven ? "bg-white" : "bg-[#f4f9fc]"
                    }`}
                  >
                    {/* Kolom Kode */}
                    <td className="text-center py-2 px-3 border-t border-r border-[#d4e4ed] font-medium text-gray-800 break-words">
                      {product.product_code || "-"}
                    </td>

                    {/* Kolom Keterangan */}
                    <td className="text-center py-2 px-3 border-t border-r border-[#d4e4ed] text-gray-800">
                      {formatDescription(product)}
                    </td>

                    {/* Kolom Harga */}
                    <td className="text-center py-2 px-3 border-t border-r border-[#d4e4ed] font-semibold text-gray-800">
                      {product.product_price != null
                        ? formatRupiah(product.product_price)
                        : "-"}
                    </td>

                    {/* Kolom Status */}
                    <td className="text-center py-2 px-3 border-t border-[#d4e4ed]">
                      <span
                        className={`inline-block font-semibold ${
                          product.is_active
                            ? "text-[#16a34a]"
                            : "text-[#dc2626]"
                        }`}
                      >
                        {product.is_active ? "Open" : "Closed"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(20);
  const [search, setSearch] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const json: ApiResponse = await res.json();

      if (!res.ok || json.error) {
        setError(json.error || `HTTP error ${res.status}`);
      } else {
        setError(null);
        setProducts(json.data || []);
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal terhubung";
      setError(message);
    } finally {
      setLoading(false);
      setCountdown(20);
    }
  }, []);

  // Initial fetch and auto-refresh interval 20 seconds
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 20000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 20));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products by search & category grouping
  const groupedProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = products.filter((p) => {
      if (!q) return true;
      const matchName = p.product_name?.toLowerCase().includes(q);
      const matchCode = p.product_code?.toLowerCase().includes(q);
      const matchCat = p.category_title?.toLowerCase().includes(q);
      const matchSub = p.product_sub_name?.toLowerCase().includes(q);
      return matchName || matchCode || matchCat || matchSub;
    });

    const grouped: Record<string, Product[]> = {};

    for (const item of filtered) {
      const cat = item.category_title?.trim() || "Lainnya";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    }

    // Urutkan kategori secara alfabetis
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, "id"));
  }, [products, search]);

  const totalVisible = useMemo(() => {
    return groupedProducts.reduce((acc, [, list]) => acc + list.length, 0);
  }, [groupedProducts]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] py-6 sm:py-10">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white py-3.5 px-8 rounded-lg shadow-md inline-block tracking-tight"
            style={{ backgroundColor: "#5087a2" }}
          >
            Daftar Harga FFZ Store
          </h1>

          {/* Status Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span>
                Auto refresh: <b>{countdown}s</b>
              </span>
            </div>

            {lastUpdated && (
              <span className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                Terakhir: <b>{lastUpdated.toLocaleTimeString("id-ID")}</b>
              </span>
            )}

            <span className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
              Total: <b>{totalVisible}</b> produk ({groupedProducts.length} kategori)
            </span>

            <button
              onClick={() => fetchData()}
              className="cursor-pointer bg-[#5087a2] hover:bg-[#407089] text-white px-3 py-1.5 rounded-full shadow-sm transition font-medium text-xs flex items-center gap-1"
              title="Perbarui sekarang"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Cari kode atau nama produk..."
              className="w-full bg-white border border-[#9abecf] focus:border-[#5087a2] focus:ring-2 focus:ring-[#5087a2]/30 text-gray-800 placeholder-gray-400 text-sm rounded-lg px-4 py-2.5 shadow-sm outline-none transition text-center"
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm text-center shadow-sm">
            <p className="font-semibold">⚠️ Terjadi Kendala:</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && products.length === 0 ? (
          <div className="w-full bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5087a2] border-t-transparent mb-3"></div>
            <p className="text-gray-500 font-medium">Memuat daftar harga produk...</p>
          </div>
        ) : (
          <>
            {/* Render Category Tables */}
            {groupedProducts.map(([categoryName, items]) => (
              <CategoryTable
                key={categoryName}
                categoryName={categoryName}
                products={items}
              />
            ))}

            {groupedProducts.length === 0 && (
              <div className="w-full bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                <p className="text-gray-500 text-base">
                  {search
                    ? `Tidak ada produk yang cocok dengan "${search}"`
                    : "Tidak ada produk yang tersedia saat ini."}
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-xs mt-8 pb-4">
          &copy; {new Date().getFullYear()} FFZ Store &mdash; Harga dapat diperbarui sewaktu-waktu secara otomatis
        </footer>
      </div>
    </div>
  );
}
