import { Button } from "@/components/ui/button";
import { ArrowRight, Percent } from "lucide-react";
import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";

interface HeroProps {
  language: Language;
}

const Hero = ({ language }: HeroProps) => {
  const t = translations[language];
  const heroImage =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80";

  return (
    <section id="home" className="pt-40 lg:pt-48 pb-8" style={{ background: 'var(--hero-gradient)' }}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full border border-accent/30">
              <Percent className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">{t.hero.promo}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {t.hero.title}
              <br />
              <span className="text-primary">{t.hero.highlight}</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              {t.hero.description}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                onClick={() => scrollToId("products")}
              >
                {t.hero.primaryCta}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent-foreground bg-accent/10 hover:bg-accent/20 rounded-full"
                onClick={() => scrollToId("deals")}
              >
                {t.hero.secondaryCta}
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">🚚</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.hero.badges.sameDay}</div>
                  <div className="text-xs text-muted-foreground">{t.hero.badges.delivery}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">✓</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.hero.badges.freshPercent}</div>
                  <div className="text-xs text-muted-foreground">{t.hero.badges.freshQuality}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg">💳</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.hero.badges.secure}</div>
                  <div className="text-xs text-muted-foreground">{t.hero.badges.payment}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src={heroImage}
                alt="Fresh groceries and produce"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating Deal Badge */}
            <div
              className={`absolute -bottom-4 bg-accent text-accent-foreground px-5 py-3 rounded-xl shadow-card ${
                language === "ar" ? "-right-4" : "-left-4"
              }`}
            >
              <div className="text-xl font-bold">{t.hero.floatingDeal.percent}</div>
              <div className="text-sm">{t.hero.floatingDeal.label}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
