import { Clock, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";
import { Language, translations } from "@/lib/i18n";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Offer } from "@/types/offer";

interface DealsSectionProps {
  products: Product[];
  offers: Offer[];
  onAddToCart: (product: Product) => void;
  language: Language;
}

const DealsSection = ({ products, offers, onAddToCart, language }: DealsSectionProps) => {
  const t = translations[language];
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const dealProducts = useMemo(() => {
    const activeOffers = offers.filter((offer) => offer.active);
    if (!activeOffers.length) {
      return products.filter((product) => product.originalPrice);
    }

    return activeOffers
      .map((offer) => {
        const product = products.find((item) => item.id === offer.productId);
        if (!product) return null;
        const discountedPrice = Math.max(0, product.price * (1 - offer.discountPercent / 100));
        return {
          ...product,
          price: Number(discountedPrice.toFixed(2)),
          originalPrice: product.price,
        };
      })
      .filter((product): product is Product => Boolean(product));
  }, [offers, products]);

  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      if (carouselApi.canScrollNext()) carouselApi.scrollNext();
      else carouselApi.scrollTo(0);
    }, 4500);
    return () => clearInterval(interval);
  }, [carouselApi]);

  if (!dealProducts.length) return null;

  return (
    <section id="deals" className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Flame className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t.deals.title}</h2>
              <p className="text-muted-foreground">{t.deals.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
            <Clock className="w-5 h-5 text-accent" />
            <span className="font-semibold text-foreground">{t.deals.endsIn}</span>
          </div>
        </div>

        <div dir="ltr">
          <Carousel opts={{ align: "start", loop: true }} setApi={setCarouselApi} className="relative">
            <CarouselContent>
              {dealProducts.map((product) => (
                <CarouselItem key={product.id} className="basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <ProductCard product={product} onAddToCart={onAddToCart} showDealBadge language={language} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 bg-background/80 hover:bg-background" />
            <CarouselNext className="-right-4 bg-background/80 hover:bg-background" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
