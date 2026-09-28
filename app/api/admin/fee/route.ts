import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getDigiFeeConfig, saveDigiFeeConfig, DigiFeeConfig } from "@/lib/fee-config";

export const dynamic = "force-dynamic";

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getDigiFeeConfig();
  return NextResponse.json({ success: true, data: config });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const newConfig: DigiFeeConfig = {
      enabled: Boolean(body.enabled),
      tier1: Math.max(0, Number(body.tier1) || 0),
      tier2: Math.max(0, Number(body.tier2) || 0),
      tier3: Math.max(0, Number(body.tier3) || 0),
      overrides: typeof body.overrides === "object" && body.overrides !== null ? body.overrides : {},
    };

    const saved = saveDigiFeeConfig(newConfig);
    if (!saved) {
      return NextResponse.json(
        { error: "Gagal menyimpan konfigurasi ke file." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan fee berhasil disimpan.",
      data: newConfig,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kesalahan server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
