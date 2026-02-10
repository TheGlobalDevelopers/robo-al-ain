import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { toast } from "sonner";
import { roboLogoDataUrl } from "@/lib/brand";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Product } from "@/types/product";

interface FooterProps {
  language: Language;
  onCategorySelect: (category: string) => void;
  products: Product[];
}

const Footer = ({ language, onCategorySelect, products }: FooterProps) => {
  const t = translations[language];
  const [addressLineOne, addressLineTwo] = t.footer.address.split("\n");
  const navigate = useNavigate();
  const location = useLocation();
  const categories = Array.from(new Set(products.map((product) => product.category))).slice(0, 7);

  const goHomeAndScroll = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => scrollToId(id), 50);
      return;
    }
    scrollToId(id);
  };

  return (
    <footer id="contact" className="bg-foreground text-background">
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">{t.footer.newsletterTitle}</h3>
              <p className="text-primary-foreground/80">{t.footer.newsletterSubtitle}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input type="email" placeholder={t.footer.emailPlaceholder} className="h-12 bg-primary-foreground border-0 text-foreground rounded-full w-full md:w-72" />
              <Button type="button" className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6" onClick={() => toast.success(t.footer.subscribeToast)}>
                {t.footer.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                  <img src={roboLogoDataUrl} alt="Robo Al Ain logo" className="h-8 w-8 object-contain" />
                </div>
                <span className="text-xl font-bold">Robo Al Ain</span>
              </div>
              <p className="text-background/60 mb-4">{t.footer.about}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.quickLinksTitle}</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><button type="button" onClick={() => goHomeAndScroll("products")}>All Products</button></li>
                <li><button type="button" onClick={() => goHomeAndScroll("deals")}>Today's Deals</button></li>
                <li><button type="button" onClick={() => navigate("/cart")}>My Cart</button></li>
                <li><button type="button" onClick={() => navigate("/admin")}>Admin</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.categoriesTitle}</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {categories.map((category) => (
                  <li key={category}>
                    <button
                      type="button"
                      onClick={() => {
                        onCategorySelect(category);
                        goHomeAndScroll("products");
                      }}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.contactTitle}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" /><span className="text-background/60 text-sm">{addressLineOne}<br />{addressLineTwo}</span></li>
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary shrink-0" /><span className="text-background/60 text-sm">+971 3 123 4567</span></li>
                <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary shrink-0" /><span className="text-background/60 text-sm">orders@roboalain.ae</span></li>
                <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary shrink-0" /><span className="text-background/60 text-sm">{t.footer.deliveryHours}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">{t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="text-background/60 text-sm">{t.footer.weAccept}</span>
            <div className="flex gap-2">
              <Link to="/payments/card" className="px-3 py-1 rounded-full bg-background/10 hover:bg-primary text-sm">Card</Link>
              <Link to="/payments/bank" className="px-3 py-1 rounded-full bg-background/10 hover:bg-primary text-sm">Bank</Link>
              <Link to="/payments/cash" className="px-3 py-1 rounded-full bg-background/10 hover:bg-primary text-sm">Cash</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
