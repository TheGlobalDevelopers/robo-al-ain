import { ShoppingCart, Search, Menu, X, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { roboLogoDataUrl } from "@/lib/brand";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onCategorySelect: (category: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const Header = ({
  cartCount,
  onCartClick,
  language,
  onToggleLanguage,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = translations[language];

  const categories = t.header.categories;
  const categoryIds = [
    "All",
    "Fresh",
    "Dairy",
    "Meat",
    "Seafood",
    "Bakery",
    "Beverages",
    "Snacks",
    "Frozen",
    "Deals",
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-card">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>{t.header.freeDelivery}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{t.header.deliveringTo}</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>{t.header.customerService}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:text-primary-foreground/80"
              onClick={onToggleLanguage}
            >
              {t.header.languageToggle}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-emerald flex items-center justify-center overflow-hidden">
              <img
                src={roboLogoDataUrl}
                alt="Robo Al Ain logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-foreground">Robo Al Ain</div>
              <div className="text-xs text-muted-foreground">Fresh Market</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.header.searchPlaceholder}
                className="pl-12 pr-4 h-12 bg-secondary border-0 rounded-full text-base"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              onClick={onToggleLanguage}
            >
              {t.header.languageToggle}
            </Button>
            <Button
              variant="default"
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-4"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-bold">{cartCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onToggleLanguage}
            >
              {t.header.languageToggle}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.header.searchMobilePlaceholder}
                className="pl-12 pr-4 h-11 bg-secondary border-0 rounded-full"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>
        </div>

      {/* Categories Bar */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="hidden lg:flex items-center gap-1 py-2 overflow-x-auto">
            {categories.map((cat, index) => (
              <Button
                key={cat}
                variant="ghost"
                className="shrink-0 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-full"
                onClick={() => {
                  const categoryId = categoryIds[index] ?? "All";
                  onCategorySelect(categoryId);
                  scrollToId(categoryId === "All" ? "home" : "products");
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card py-4">
          <div className="container mx-auto px-4 space-y-2">
            {categories.map((cat, index) => (
              <Button
                key={cat}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => {
                  const categoryId = categoryIds[index] ?? "All";
                  setIsMenuOpen(false);
                  onCategorySelect(categoryId);
                  scrollToId(categoryId === "All" ? "home" : "products");
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
