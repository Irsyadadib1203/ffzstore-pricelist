import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FFZ Store - Platform Top Up & Produk Digital",
  description: "Penyedia layanan top up game dan produk digital otomatis 24 jam terpercaya.",
};

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f8fafc",
        color: "#1e293b",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "16px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: "#4f839d",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              F
            </div>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
              FFZ Store
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#166534",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "inline-block",
                }}
              />
              Sistem Normal
            </div>

            <a
              href="https://ffzstore.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#4f839d",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
              }}
            >
              Buka ffzstore.com &rarr;
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "60px 20px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "20px",
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          Penyedia Layanan Digital & Game
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.3,
            marginBottom: "16px",
            letterSpacing: "-0.5px",
          }}
        >
          Solusi Top Up Cepat, Aman, & Terintegrasi
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: "600px",
            margin: "0 auto 32px",
          }}
        >
          FFZ Store menyediakan integrasi pengisian game dan produk digital otomatis dengan dukungan infrastruktur stabil dan harga terbaik.
        </p>

        {/* Button Menuju Website Utama */}
        <div style={{ marginBottom: "50px" }}>
          <a
            href="https://ffzstore.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#4f839d",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(79, 131, 157, 0.25)",
              transition: "transform 0.15s ease, background-color 0.15s ease",
            }}
          >
            <span>Kunjungi Website FFZ Store</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "30px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>⚡</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>
              Proses Otomatis
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.5 }}>
              Pesanan diproses secara instan dan otomatis melalui jalur API langsung tanpa penundaan.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🛡️</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>
              Aman & Terpercaya
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.5 }}>
              Keamanan data transaksi terjamin dengan jalur koneksi berstandar industri.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🕒</div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#1e293b" }}>
              Siap 24/7
            </h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.5 }}>
              Infrastruktur server selalu aktif melayani transaksi kebutuhan digital Anda setiap saat.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          padding: "24px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13px",
        }}
      >
        <p>&copy; {new Date().getFullYear()} FFZ Store. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}