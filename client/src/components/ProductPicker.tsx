import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export function ProductPicker({
  value,
  onChange,
  label = "Product",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const input = useMemo(() => ({ query: query.trim() }), [query]);
  const products = trpc.logs.products.useQuery(input, {
    enabled: open || Boolean(query),
  });
  const selected = products.data?.find(
    product => product.metrcPackageId === value
  );
  const choose = (packageId: string) => {
    onChange(packageId);
    const product = products.data?.find(
      item => item.metrcPackageId === packageId
    );
    setQuery(
      product
        ? `${product.productName} · ${product.packageLabel ?? product.metrcPackageId}`
        : ""
    );
    setOpen(false);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(index =>
        Math.min(index + 1, Math.max((products.data?.length ?? 1) - 1, 0))
      );
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && open && products.data?.[activeIndex]) {
      event.preventDefault();
      choose(products.data[activeIndex].metrcPackageId);
    }
    if (event.key === "Escape") setOpen(false);
  };
  return (
    <div className="space-y-2">
      <Label
        htmlFor="product-search"
        className="text-sm font-semibold text-[#30453f]"
      >
        {label}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#87958e]" />
        <Input
          ref={inputRef}
          id="product-search"
          role="combobox"
          aria-expanded={open}
          aria-controls="metrc-product-suggestions"
          aria-autocomplete="list"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={event => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search synced product or package"
          className="h-11 border-[#ccd8cf] bg-white pl-9 pr-10 focus-visible:ring-[#5e8b62]"
        />
        <button
          type="button"
          aria-label="Open product suggestions"
          onClick={() => {
            setOpen(current => !current);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-[#87958e] hover:bg-[#f0f5ef]"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            id="metrc-product-suggestions"
            role="listbox"
            className="motion-pop absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-[#ccd8cf] bg-white p-1 shadow-[0_16px_30px_rgba(18,53,47,0.12)]"
          >
            {products.isLoading ? (
              <p className="px-3 py-3 text-sm text-[#7d8a84]">
                Loading synced inventory…
              </p>
            ) : products.data?.length ? (
              products.data.map((product, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={product.metrcPackageId === value}
                  key={product.metrcPackageId}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => choose(product.metrcPackageId)}
                  style={{ animationDelay: `${Math.min(index, 5) * 24}ms` }}
                  className={`motion-list flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${index === activeIndex ? "bg-[#f0f5ef]" : "hover:bg-[#f7faf6]"}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[#203b35]">
                      {product.productName}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#7d8a84]">
                      {product.packageLabel ?? product.metrcPackageId} ·{" "}
                      {product.quantity} {product.unitOfMeasure}
                    </span>
                  </span>
                  {product.metrcPackageId === value && (
                    <Check className="h-4 w-4 shrink-0 text-[#356e45]" />
                  )}
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-[#7d8a84]">
                No synced products match this search.
              </p>
            )}
          </div>
        )}
      </div>
      {selected && (
        <p className="rounded-lg bg-[#f0f5ef] px-3 py-2 text-xs text-[#52625d]">
          Metrc:{" "}
          <strong className="text-[#173f3a]">
            {selected.quantity} {selected.unitOfMeasure}
          </strong>{" "}
          · Testing:{" "}
          <strong className="text-[#173f3a]">{selected.testingStatus}</strong>
        </p>
      )}
    </div>
  );
}
