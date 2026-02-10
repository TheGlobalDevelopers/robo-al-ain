import { ShoppingCart, Search, Menu, X, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { roboLogoDataUrl } from "@/lib/brand";
import { loadLocationCookie } from "@/lib/cookies";

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
  const savedLocation = loadLocationCookie();

  const categories = useMemo(
    () => [
      { label: t.header.categories[0], id: "All", scroll: "home" },
      { label: t.header.categories[1], id: "Fresh", scroll: "products" },
      { label: t.header.categories[2], id: "Dairy", scroll: "products" },
      { label: t.header.categories[3], id: "Meat", scroll: "products" },
      { label: t.header.categories[4], id: "Seafood", scroll: "products" },
      { label: t.header.categories[5], id: "Bakery", scroll: "products" },
      { label: t.header.categories[6], id: "Beverages", scroll: "products" },
      { label: t.header.categories[7], id: "Snacks", scroll: "products" },
      { label: t.header.categories[8], id: "Frozen", scroll: "products" },
      { label: t.header.categories[9], id: "Deals", scroll: "deals" },
    ],
    [t.header.categories]
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border/60">
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Truck className="h-4 w-4" />
              <span>{t.header.freeDelivery}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{savedLocation || t.header.deliveringTo}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary-foreground/80" onClick={onToggleLanguage}>
            {t.header.languageToggle}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-emerald flex items-center justify-center overflow-hidden shrink-0">
              <img src={roboLogoDataUrl} alt="Robo Al Ain logo" className="h-9 w-9 object-contain" />
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="text-xl font-bold text-foreground truncate">Robo Al Ain</div>
              <div className="text-xs text-muted-foreground">Fresh Market</div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.header.searchPlaceholder}
              className="pl-10 h-11 sm:h-12 bg-secondary border-0 rounded-full"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="default" className="gap-1 sm:gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-3 sm:px-4" onClick={onCartClick}>
              <ShoppingCart className="h-5 w-5" />
              <span className="font-bold">{cartCount}</span>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen((prev) => !prev)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="hidden lg:flex items-center justify-center gap-1 py-2 overflow-x-auto">
            {categories.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="shrink-0 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-full"
                onClick={() => {
                  onCategorySelect(item.id);
                  scrollToId(item.scroll);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {isMenuOpen && (
            <div className="lg:hidden py-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((item) => (
                <Button
                  key={item.label}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onCategorySelect(item.id);
                    scrollToId(item.scroll);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
