"use client";

import { useEffect, useState, useMemo } from "react";

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
  const isFreeFire = (product.category_title || "").toLowerCase().includes("free fire");

  if (isFreeFire) {
    // Khusus kategori Free Fire: hilangkan kurung beserta teks di dalamnya
    name = name.replace(/\s*\([^)]*\)/g, "").trim();
    return name;
  }

  // Kategori lainnya: hapus kurung kosong " ()"
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

/**
 * Urutan tampilan untuk produk Mobile Legends:
 *   0 — denom ML biasa (top-up diamond) & produk lain di luar ML
 *   1 — MLWP (Weekly Pass)
 *   2 — MLTW (Weekly Diamond Pass / membership mingguan)
 * MLTW selalu paling bawah, MLWP tepat di atasnya, sisanya (denom biasa)
 * tetap di urutan paling atas sesuai urutan asli dari API.
 */
function getMlSortRank(product: Product): number {
  const code = (product.product_code || "").trim().toLowerCase();

  // tangkap ml-tw, ml_tw, ml tw, mltw, ml-tw-01, dst — cek dulu sebelum mlwp
  // supaya kode seperti "ml-tw" tidak salah kena aturan mlwp
  if (/ml[\s_-]*tw/.test(code)) return 2;

  // tangkap ml-wp, ml_wp, ml wp, mlwp, dst
  if (/ml[\s_-]*wp/.test(code)) return 1;

  return 0;
}

/** Mengurutkan produk dalam satu kategori: denom ML biasa → MLWP → MLTW,
 * dengan urutan asli tetap terjaga di dalam masing-masing grup (stable sort). */
function sortProductsByMlPriority(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => getMlSortRank(a) - getMlSortRank(b),
  );
}

// ─── Table Component ─────────────────────────────────────────────────────────

function CategoryTable({
  categoryName,
  products,
}: {
  categoryName: string;
  products: Product[];
}) {
  return (
    <div className="table-wrapper">
      <table className="pricelist-table">
        <thead>
          {/* Header Kategori */}
          <tr>
            <th colSpan={4} className="category-header">
              {categoryName}
            </th>
          </tr>
          {/* Header Kolom */}
          <tr>
            <th className="column-header" style={{ width: "20%" }}>
              Kode
            </th>
            <th className="column-header" style={{ width: "45%" }}>
              Keterangan
            </th>
            <th className="column-header" style={{ width: "20%" }}>
              Harga
            </th>
            <th className="column-header" style={{ width: "15%" }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="table-cell" style={{ padding: "16px" }}>
                Tidak ada produk
              </td>
            </tr>
          ) : (
            products.map((product, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={product.product_id || product.product_code || idx}
                  className={isEven ? "table-row-even" : "table-row-odd"}
                >
                  <td className="table-cell">
                    {product.product_code || "-"}
                  </td>
                  <td className="table-cell">
                    {formatDescription(product)}
                  </td>
                  <td className="table-cell">
                    {product.product_price != null
                      ? formatRupiah(product.product_price)
                      : "-"}
                  </td>
                  <td className="table-cell">
                    <span
                      className={
                        product.is_active ? "status-open" : "status-closed"
                      }
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
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const json: ApiResponse = await res.json();

        if (!isMounted) return;

        if (!res.ok || json.error) {
          setError(json.error || `HTTP error ${res.status}`);
        } else {
          setError(null);
          setProducts(json.data || []);
          setLastUpdated(new Date().toLocaleTimeString("id-ID"));
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Gagal memuat data";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Panggilan pertama
    loadData();

    // Auto refresh setiap 60 detik
    const interval = setInterval(() => {
      loadData();
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Grouping by Category
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, Product[]> = {};

    for (const item of products) {
      // 1. Pastikan produk dengan kode FFMX tidak dimasukkan
      if (item.product_code && item.product_code.toUpperCase().includes("FFM")||item.product_code.toUpperCase().includes("FFP")||item.product_code.toUpperCase().includes("MLP")) {
        continue;
      }

      const catTitle = (item.category_title || "").toLowerCase();

      // 2. Jangan tampilkan Mobile Legends: Filipina dan Mobile Legends: Global
      if (
        catTitle.includes("filipina") ||
        catTitle.includes("free firee") ||
        catTitle.includes("philippines") ||
        (catTitle.includes("mobile legends") && catTitle.includes("global"))
      )
      {
        continue;
      }

      const cat = item.category_title?.trim() || "Lainnya";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    }

    // 3. Urutkan tiap kategori: denom ML biasa → MLWP → MLTW (paling bawah)
    for (const cat of Object.keys(grouped)) {
      grouped[cat] = sortProductsByMlPriority(grouped[cat]);
    }

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, "id"));
  }, [products]);

  const totalProducts = useMemo(() => {
    return groupedProducts.reduce((acc, [, list]) => acc + list.length, 0);
  }, [groupedProducts]);

  return (
    <div className="pricelist-container">
      {/* Header Halaman */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            backgroundColor: "#4f839d",
            color: "#ffffff",
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: "6px",
            fontSize: "24px",
            fontWeight: "bold",
            letterSpacing: "0.5px",
            marginBottom: "10px",
          }}
        >
          Daftar Harga FFZ Store
        </h1>

        <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
          {lastUpdated && `Terakhir diperbarui: ${lastUpdated}`}
          {totalProducts > 0 &&
            ` — ${totalProducts} produk dari ${groupedProducts.length} kategori`}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #f87171",
            color: "#b91c1c",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#64748b",
            fontSize: "15px",
          }}
        >
          Memuat data harga...
        </div>
      ) : (
        /* Tabel per Kategori */
        groupedProducts.map(([categoryName, items]) => (
          <CategoryTable
            key={categoryName}
            categoryName={categoryName}
            products={items}
          />
        ))
      )}

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "30px",
          paddingBottom: "20px",
        }}
      >
        &copy; {new Date().getFullYear()} FFZ Store &mdash; Harga diperbarui otomatis setiap 60 detik
      </footer>
    </div>
  );
}