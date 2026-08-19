import { CheckCircle2, ExternalLink, ShoppingBag } from "lucide-react";
import type { RecommendedProduct } from "@/types/recommendation";

interface ProductCardProps {
  product: RecommendedProduct;
  index: number;
  onAddToBag: (product: RecommendedProduct) => void;
}

const ProductCard = ({ product, index, onAddToBag }: ProductCardProps) => {
  return (
    <div
      className="rounded-2xl overflow-hidden group animate-stagger-in h-full flex flex-col"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "both",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
      }}
    >
      {/* ── Image area ── */}
      <div className="aspect-[4/5] overflow-hidden relative shrink-0" style={{ background: "#f5f5f5" }}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "#999" }}>
            No image available
          </div>
        )}

        {product.soldOut && (
          <div
            className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: "rgba(0,0,0,0.75)", color: "#fff" }}
          >
            Sold Out
          </div>
        )}

        {product.fitVerified && !product.soldOut && (
          <div
            className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1"
            style={{ background: "#ff5a1f", color: "#fff" }}
          >
            <CheckCircle2 size={10} />
            {product.fitMatchLabel || "Size verified"}
          </div>
        )}
      </div>

      {/* ── Info area ── */}
      <div className="p-4 flex flex-1 flex-col">
        <div>
          <h4
            className="font-medium text-sm leading-tight min-h-[4.5rem]"
            style={{ color: "#1a1a1a" }}
          >
            {product.title}
          </h4>
          <p className="font-bold text-base mt-2" style={{ color: "#ff5a1f" }}>
            {product.currency} {product.price}
          </p>
        </div>

        <p
          className="text-xs leading-relaxed mt-3 min-h-[3.5rem]"
          style={{ color: "#666" }}
        >
          {product.reason}
        </p>

        <div className="mt-auto pt-4 flex flex-col gap-2">
          {product.storeUrl && (
            <a
              href={product.storeUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[44px] text-sm px-4 py-2.5 flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 hover:opacity-80"
              style={{
                border: "1.5px solid #1a1a1a",
                color: "#1a1a1a",
                background: "transparent",
              }}
            >
              <ExternalLink size={14} />
              View in store
            </a>
          )}

          <button
            onClick={() => {
              if (product.soldOut) return;
              onAddToBag(product);
            }}
            disabled={product.soldOut || !product.addToCartUrl}
            className={`w-full min-h-[44px] text-sm px-4 py-2.5 flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ${
              product.soldOut || !product.addToCartUrl
                ? "opacity-40 cursor-not-allowed"
                : "hover:opacity-90"
            }`}
            style={{
              background: product.soldOut || !product.addToCartUrl ? "#ccc" : "#ff5a1f",
              color: "#fff",
              border: "none",
            }}
          >
            <ShoppingBag size={14} />
            {product.soldOut ? "Sold out" : "Bag"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
