import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function ProductPicker({ value, onChange, label = "Product" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const [query, setQuery] = useState("");
  const input = useMemo(() => ({ query }), [query]);
  const products = trpc.logs.products.useQuery(input);
  const selected = products.data?.find(product => product.metrcPackageId === value);
  return (
    <div className="space-y-2">
      <Label htmlFor="product-search" className="text-sm font-semibold text-[#30453f]">{label}</Label>
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#87958e]" /><Input id="product-search" value={query} onChange={event => { setQuery(event.target.value); if (value) onChange(""); }} placeholder="Search product or package" className="h-11 border-[#ccd8cf] bg-white pl-9 focus-visible:ring-[#5e8b62]" /></div>
      <select value={value} onChange={event => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-[#ccd8cf] bg-white px-3 text-sm text-[#173f3a] outline-none focus:ring-2 focus:ring-[#5e8b62]" aria-label="Select Metrc product">
        <option value="">{products.isLoading ? "Loading inventory…" : "Select a product"}</option>
        {products.data?.map(product => <option key={product.metrcPackageId} value={product.metrcPackageId}>{product.productName} · {product.packageLabel ?? product.metrcPackageId} · {product.quantity} {product.unitOfMeasure}</option>)}
      </select>
      {selected && <p className="rounded-lg bg-[#f0f5ef] px-3 py-2 text-xs text-[#52625d]">Metrc: <strong className="text-[#173f3a]">{selected.quantity} {selected.unitOfMeasure}</strong> · Testing: <strong className="text-[#173f3a]">{selected.testingStatus}</strong></p>}
    </div>
  );
}
