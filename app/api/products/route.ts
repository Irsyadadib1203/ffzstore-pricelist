import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const apiKey = process.env.FFZSTORE_API_KEY;
  const baseUrl = process.env.FFZSTORE_BASE_URL ?? "https://api.ffzstore.com";

  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      { error: "API Key belum dikonfigurasi di .env.local", data: [] },
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
    const rawList = Array.isArray(json) ? json : (json.data ?? []);

    // Filter out items where product_code contains "FFMX"
    const filtered = rawList.filter((item: { product_code?: string }) => {
      if (!item.product_code) return true;
      return !item.product_code.toUpperCase().includes("FFMX");
    });

    return NextResponse.json({
      statusCode: 200,
      message: "success",
      data: filtered,
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
