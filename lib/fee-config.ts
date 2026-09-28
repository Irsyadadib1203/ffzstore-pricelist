import fs from "fs";
import path from "path";

export interface DigiFeeConfig {
  enabled: boolean;
  tier1: number; // <= Rp10.000
  tier2: number; // Rp10.001 - Rp25.000
  tier3: number; // > Rp25.000
  overrides: Record<string, number>; // misal: { "FF-82": 10, "FF-195": 25 }
}

export const DEFAULT_DIGI_FEE_CONFIG: DigiFeeConfig = {
  enabled: true,
  tier1: 5,
  tier2: 10,
  tier3: 25,
  overrides: {
    "FF-82": 10,
    "FF-195": 25,
  },
};

function getConfigFilePath(): string {
  return path.join(process.cwd(), "data", "digi-fee.json");
}

export function getDigiFeeConfig(): DigiFeeConfig {
  try {
    const filePath = getConfigFilePath();
    if (!fs.existsSync(filePath)) {
      return DEFAULT_DIGI_FEE_CONFIG;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      tier1: Number(parsed.tier1) || 0,
      tier2: Number(parsed.tier2) || 0,
      tier3: Number(parsed.tier3) || 0,
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
    };
  } catch (error) {
    console.error("Gagal membaca file konfigurasi fee:", error);
    return DEFAULT_DIGI_FEE_CONFIG;
  }
}

export function saveDigiFeeConfig(config: DigiFeeConfig): boolean {
  try {
    const dirPath = path.join(process.cwd(), "data");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = getConfigFilePath();
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Gagal menyimpan file konfigurasi fee:", error);
    return false;
  }
}

/**
 * Menghitung harga akhir berdasarkan aturan fee:
 * 1. Jika fee nonaktif -> harga asli
 * 2. Cek override kode produk (case-insensitive) -> harga asli + fee override
 * 3. Jika tidak ada di override, cek tier harga:
 *    - <= 10.000 -> + tier1
 *    - <= 25.000 -> + tier2
 *    - > 25.000  -> + tier3
 */
export function calculateDigiPrice(
  originalPrice: number,
  productCode: string,
  config: DigiFeeConfig
): number {
  if (!config.enabled) {
    return originalPrice;
  }

  const cleanCode = (productCode || "").trim().toUpperCase();

  // 1. Cek apakah ada di override
  if (config.overrides) {
    for (const [code, fee] of Object.entries(config.overrides)) {
      if (code.trim().toUpperCase() === cleanCode) {
        return originalPrice + (Number(fee) || 0);
      }
    }
  }

  // 2. Jika tidak ada di override, gunakan fee tier
  if (originalPrice <= 10000) {
    return originalPrice + (Number(config.tier1) || 0);
  } else if (originalPrice <= 25000) {
    return originalPrice + (Number(config.tier2) || 0);
  } else {
    return originalPrice + (Number(config.tier3) || 0);
  }
}
