import { NextRequest, NextResponse } from "next/server";
import { getDigiFeeConfig, calculateDigiPrice } from "@/lib/fee-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductItem {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = (searchParams.get("tier") || "h2h").toLowerCase();

  const baseUrl = process.env.FFZSTORE_BASE_URL ?? "https://api.ffzstore.com";

  let apiKey: string | undefined;
  if (tier === "digi") {
    apiKey = process.env.FFZSTORE_API_KEY_DIGI || process.env.FFZSTORE_API_KEY;
  } else {
    // Default tier adalah H2H
    apiKey = process.env.FFZSTORE_API_KEY_H2H || process.env.FFZSTORE_API_KEY;
  }

  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      {
        error: `API Key untuk tier [${tier.toUpperCase()}] belum dikonfigurasi di .env.local (${
          tier === "digi" ? "FFZSTORE_API_KEY_DIGI" : "FFZSTORE_API_KEY_H2H"
        })`,
        data: [],
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/v1/products`, {
      headers: {
        Authorization: apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `API Error (${res.status}): ${errText}`, data: [] },
        { status: res.status }
      );
    }

    const json = await res.json();
    const rawList: ProductItem[] = Array.isArray(json) ? json : (json.data ?? []);

    // Filter out:
    // 1. FFMX codes, FFP, MLP
    // 2. Mobile Legends: Filipina & Global
    // 3. Free Firee
    const filtered = rawList.filter((item) => {
      const code = (item.product_code || "").toUpperCase();
      const cat = (item.category_title || "").toLowerCase();

      if (code.includes("FFMX") || code.includes("FFM") || code.includes("FFP") || code.includes("MLP")) {
        return false;
      }
      if (cat.includes("filipina") || cat.includes("philippines")) return false;
      if (cat.includes("free firee")) return false;
      if (cat.includes("mobile legends") && cat.includes("global")) return false;

      return true;
    });

    let feeApplied = false;

    // Jika tier digi, terapkan fee seller
    let processedList = filtered;
    if (tier === "digi") {
      const feeConfig = getDigiFeeConfig();
      feeApplied = feeConfig.enabled;

      if (feeConfig.enabled) {
        processedList = filtered.map((item) => {
          const finalPrice = calculateDigiPrice(
            item.product_price,
            item.product_code,
            feeConfig
          );
          return {
            ...item,
            product_price: finalPrice,
          };
        });
      }
    }

    return NextResponse.json({
      statusCode: 200,
      message: "success",
      tier,
      feeApplied,
      data: processedList,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Fetch error: ${errorMessage}`, data: [] },
      { status: 500 }
    );
  }
}