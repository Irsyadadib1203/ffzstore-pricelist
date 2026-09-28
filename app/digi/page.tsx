import type { Metadata } from "next";
import PricelistView from "@/components/PricelistView";

export const metadata: Metadata = {
  title: "Daftar Harga FFZ Store (Digi)",
  description: "Daftar harga produk FFZ Store level Digiflazz",
};

export default function DigiPage() {
  return <PricelistView tier="digi" title="Daftar Harga FFZ Store" />;
}
