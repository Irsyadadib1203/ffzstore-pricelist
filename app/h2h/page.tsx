import type { Metadata } from "next";
import PricelistView from "@/components/PricelistView";

export const metadata: Metadata = {
  title: "Daftar Harga FFZ Store (H2H)",
  description: "Daftar harga produk FFZ Store level H2H",
};

export default function H2HPage() {
  return <PricelistView tier="h2h" title="Daftar Harga FFZ Store" />;
}
