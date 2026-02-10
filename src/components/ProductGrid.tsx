import ProductCard from "./ProductCard";
import { Product } from "@/types/product";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { getProductName } from "@/lib/productLabels";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  language: Language;
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
}

const ProductGrid = ({
  products,
  onAddToCart,
  language,
  activeTab,
  onTabChange,
  searchQuery,
}: ProductGridProps) => {
  const t = translations[language];
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [activeTab, searchQuery]);

  const baseProducts = activeTab === "All"
    ? products
    : activeTab === "Deals"
      ? products.filter((product) => product.originalPrice)
      : products.filter((product) =>
          product.category.toLowerCase().includes(activeTab.toLowerCase())
        );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchedProducts = normalizedSearch
    ? products.filter((product) => {
        const localizedName = getProductName(language, product).toLowerCase();
        const englishName = product.name.toLowerCase();
        const categoryName = product.category.toLowerCase();
        return (
          localizedName.includes(normalizedSearch) ||
          englishName.includes(normalizedSearch) ||
          categoryName.includes(normalizedSearch)
        );
      })
    : baseProducts;

  const displayProducts = showAll ? searchedProducts : searchedProducts.slice(0, 12);

  return (
    <section id="products" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t.products.title}
            </h2>
            <p className="text-muted-foreground">
              {t.products.subtitle}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {t.products.tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`rounded-full shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border-border hover:bg-secondary"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              language={language}
            />
          ))}
        </div>

        {searchedProducts.length > 12 && !showAll && (
          <div className="text-center mt-10">
            <Button 
              size="lg"
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary/10 px-8"
              onClick={() => setShowAll(true)}
            >
              {t.products.loadMore}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
