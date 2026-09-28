"use client";

import { useEffect, useState, FormEvent } from "react";

interface DigiFeeConfig {
  enabled: boolean;
  tier1: number;
  tier2: number;
  tier3: number;
  overrides: Record<string, number>;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Fee Config States
  const [config, setConfig] = useState<DigiFeeConfig>({
    enabled: true,
    tier1: 5,
    tier2: 10,
    tier3: 25,
    overrides: {
      "FF-82": 10,
      "FF-195": 25,
    },
  });

  // Override inputs
  const [overrideCode, setOverrideCode] = useState("");
  const [overrideFee, setOverrideFee] = useState("");
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/fee");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setConfig(json.data);
          }
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Gagal login.");
      } else {
        setIsAuthenticated(true);
        // Load latest config
        const feeRes = await fetch("/api/admin/fee");
        if (feeRes.ok) {
          const feeJson = await feeRes.json();
          if (feeJson.data) setConfig(feeJson.data);
        }
      }
    } catch {
      setLoginError("Terjadi kesalahan saat login.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  function handleAddOverride(e: FormEvent) {
    e.preventDefault();
    const code = overrideCode.trim().toUpperCase();
    const feeNum = parseInt(overrideFee.trim(), 10);

    if (!code) {
      alert("Masukkan kode produk.");
      return;
    }
    if (isNaN(feeNum) || feeNum < 0) {
      alert("Masukkan nominal fee yang valid (angka positif).");
      return;
    }

    setConfig((prev) => ({
      ...prev,
      overrides: {
        ...prev.overrides,
        [code]: feeNum,
      },
    }));

    setOverrideCode("");
    setOverrideFee("");
  }

  function handleRemoveOverride(codeToRemove: string) {
    setConfig((prev) => {
      const updated = { ...prev.overrides };
      delete updated[codeToRemove];
      return {
        ...prev,
        overrides: updated,
      };
    });
  }

  async function handleSaveConfig() {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ type: "success", message: "Pengaturan fee level ini berhasil disimpan!" });
        if (data.data) {
          setConfig(data.data);
        }
      } else {
        setSaveStatus({ type: "error", message: data.error || "Gagal menyimpan pengaturan." });
      }
    } catch {
      setSaveStatus({ type: "error", message: "Terjadi kesalahan jaringan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  }

  // Loading auth state
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1f5f9",
          color: "#64748b",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        Memuat panel admin...
      </div>
    );
  }

  // Login View
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            border: "1px solid #e2e8f0",
            padding: "32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "22px",
                marginBottom: "12px",
              }}
            >
              ⚙️
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: "13.5px", color: "#64748b" }}>
              Kelola pengaturan fee Digiflazz
            </p>
          </div>

          {loginError && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                marginTop: "8px",
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loginLoading ? "not-allowed" : "pointer",
                opacity: loginLoading ? 0.7 : 1,
              }}
            >
              {loginLoading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Settings View (Sesuai Gambar)
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "30px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        {/* Top Navbar Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>
              Panel Konfigurasi
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              color: "#ef4444",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {/* Notifikasi Simpan */}
        {saveStatus && (
          <div
            style={{
              backgroundColor: saveStatus.type === "success" ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${saveStatus.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              color: saveStatus.type === "success" ? "#065f46" : "#b91c1c",
              padding: "12px 18px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {saveStatus.message}
          </div>
        )}

        {/* Main Card (Persis Screenshot) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
            padding: "28px 32px",
          }}
        >
          {/* Header Row: Title & Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              >
                Fee Seller Berjenjang &mdash; Level DIGIFLAZZ
              </h2>
              <p style={{ fontSize: "13.5px", color: "#64748b" }}>
                Pengaturan ini independen untuk level API key ini.
              </p>
            </div>

            {/* Toggle Switch */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", color: "#334155", fontWeight: 500 }}>
                Aktifkan fee penyesuaian
              </span>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
                style={{
                  width: "50px",
                  height: "28px",
                  borderRadius: "14px",
                  backgroundColor: config.enabled ? "#4f46e5" : "#cbd5e1",
                  position: "relative",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  padding: "2px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    position: "absolute",
                    top: "2px",
                    left: config.enabled ? "24px" : "2px",
                    transition: "left 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Yellow Banner Info */}
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "8px",
              padding: "14px 18px",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#92400e", marginBottom: "3px" }}>
              Skema fee seller
            </div>
            <div style={{ fontSize: "13px", color: "#b45309" }}>
              Harga API &le; Rp10.000: tambah tier 1. Rp10.001&ndash;Rp25.000: tambah tier 2. Di atas Rp25.000: tambah tier 3.
            </div>
          </div>

          {/* 3 Tier Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            {/* Card Tier 1 */}
            <div
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                backgroundColor: "#fcfdfe",
                padding: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                TIER 1 (Kecil)
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                Nominal &le; Rp10.000
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>+ Rp</span>
                <input
                  type="number"
                  min="0"
                  value={config.tier1}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      tier1: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  style={{
                    width: "80px",
                    padding: "7px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Card Tier 2 */}
            <div
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                backgroundColor: "#fcfdfe",
                padding: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                TIER 2 (Menengah)
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                Rp10.001 &ndash; Rp25.000
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>+ Rp</span>
                <input
                  type="number"
                  min="0"
                  value={config.tier2}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      tier2: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  style={{
                    width: "80px",
                    padding: "7px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Card Tier 3 */}
            <div
              style={{
                border: "1px solid #f1f5f9",
                borderRadius: "12px",
                backgroundColor: "#fcfdfe",
                padding: "20px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                TIER 3 (Besar)
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                Nominal &gt; Rp25.000
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>+ Rp</span>
                <input
                  type="number"
                  min="0"
                  value={config.tier3}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      tier3: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  style={{
                    width: "80px",
                    padding: "7px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Override fee per kode produk */}
          <div style={{ marginBottom: "28px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "4px",
              }}
            >
              Override fee per kode produk
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "18px",
                lineHeight: 1.5,
              }}
            >
              Override selalu diprioritaskan daripada tier otomatis. Masukkan kode produk, misalnya FF-5 atau FF-MM, untuk memakai fee khusus.
            </p>

            {/* Form row inputs */}
            <form
              onSubmit={handleAddOverride}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto",
                gap: "14px",
                alignItems: "end",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Kode produk
                </label>
                <input
                  type="text"
                  placeholder="Contoh: FF-5 atau FF-MM"
                  value={overrideCode}
                  onChange={(e) => setOverrideCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13.5px",
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Fee (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 10"
                  value={overrideFee}
                  onChange={(e) => setOverrideFee(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "13.5px",
                    color: "#1e293b",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Tambah override
                </button>
              </div>
            </form>

            {/* List Chips / Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {Object.entries(config.overrides || {}).length === 0 ? (
                <div style={{ fontSize: "12.5px", color: "#94a3b8", fontStyle: "italic" }}>
                  Belum ada kode produk di override. Semua produk akan memakai skema tier otomatis.
                </div>
              ) : (
                Object.entries(config.overrides).map(([code, fee]) => (
                  <div
                    key={code}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#f5f3ff",
                      border: "1px solid #e0e7ff",
                      color: "#4f46e5",
                      padding: "5px 12px",
                      borderRadius: "16px",
                      fontSize: "12.5px",
                      fontWeight: 600,
                    }}
                  >
                    <span>
                      Kode {code}: +Rp{fee}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOverride(code)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6366f1",
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "0 2px",
                        lineHeight: 1,
                      }}
                      title="Hapus override"
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Row: Simpan Pengaturan */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSaving}
              style={{
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.7 : 1,
                boxShadow: "0 1px 3px rgba(79, 70, 229, 0.3)",
              }}
            >
              {isSaving ? "Menyimpan..." : "Simpan pengaturan fee level ini"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
