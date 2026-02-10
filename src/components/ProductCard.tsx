import { ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { getProductCategory, getProductName, getProductUnit } from "@/lib/productLabels";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showDealBadge?: boolean;
  language: Language;
}

const ProductCard = ({ product, onAddToCart, showDealBadge, language }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const t = translations[language];

  useEffect(() => {
    if (!product.inStock) {
      setQuantity(0);
    }
  }, [product.inStock]);

  const handleAdd = () => {
    setQuantity(1);
    onAddToCart(product);
  };

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div
      className={`bg-card rounded-xl overflow-hidden shadow-card transition-all duration-300 group hover:-translate-y-1 hover:scale-[1.01] ${
        product.inStock ? "hover:shadow-card-hover" : "opacity-60 grayscale"
      }`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.originalPrice && (
          <div
            className={`absolute top-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold ${
              language === "ar" ? "right-2" : "left-2"
            }`}
          >
            {discount}
            {t.productCard.offLabel}
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground px-3 py-1 rounded-full text-sm font-medium">
              {t.productCard.outOfStock}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {getProductCategory(language, product)}
        </span>
        <h3 className="font-semibold text-foreground mt-1 mb-1 line-clamp-2 text-sm md:text-base min-h-[2.5rem]">
          {getProductName(language, product)}
        </h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">• {getProductUnit(language, product)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {product.price.toFixed(2)} AED
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          {!product.inStock ? (
            <Button
              className="w-full rounded-lg gap-2"
              variant="outline"
              disabled
            >
              {t.productCard.outOfStock}
            </Button>
          ) : quantity === 0 ? (
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2"
              onClick={handleAdd}
            >
              <ShoppingCart className="h-4 w-4" />
              {t.productCard.addToCart}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-secondary rounded-lg p-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-md"
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-foreground">{quantity}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-md"
                onClick={() => {
                  setQuantity(quantity + 1);
                  onAddToCart(product);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
