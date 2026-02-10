import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";
import { toast } from "sonner";
import { roboLogoDataUrl } from "@/lib/brand";

interface FooterProps {
  language: Language;
  onCategorySelect: (category: string) => void;
}

const Footer = ({ language, onCategorySelect }: FooterProps) => {
  const t = translations[language];
  const quickLinkTargets = ["products", "deals", "products", "products", "contact", "contact"];
  const [addressLineOne, addressLineTwo] = t.footer.address.split("\n");

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-primary-foreground">{t.footer.newsletterTitle}</h3>
              <p className="text-primary-foreground/80">{t.footer.newsletterSubtitle}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className="h-12 bg-primary-foreground border-0 text-foreground rounded-full w-full md:w-72"
              />
              <Button
                type="button"
                className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6"
                onClick={() => toast.success(t.footer.subscribeToast)}
              >
                {t.footer.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
                  <img
                    src={roboLogoDataUrl}
                    alt="Robo Al Ain logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-xl font-bold">Robo Al Ain</span>
              </div>
              <p className="text-background/60 mb-4">{t.footer.about}</p>
              <div className="flex gap-3">
                {["📘", "📷", "🐦", "📺"].map((emoji, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    {emoji}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.quickLinksTitle}</h4>
              <ul className="space-y-2">
                {t.footer.quickLinks.map((link, index) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                      onClick={() => {
                        if (quickLinkTargets[index] === "products") {
                          onCategorySelect("All");
                        }
                        scrollToId(quickLinkTargets[index]);
                      }}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.categoriesTitle}</h4>
              <ul className="space-y-2">
                {t.footer.categories.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-background/60 hover:text-primary transition-colors text-sm"
                      onClick={() => {
                        onCategorySelect("All");
                        scrollToId("categories");
                      }}
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.contactTitle}</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-background/60 text-sm">
                    {addressLineOne}
                    <br />
                    {addressLineTwo}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-background/60 text-sm">+971 3 123 4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-background/60 text-sm">orders@roboalain.ae</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-background/60 text-sm">{t.footer.deliveryHours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-background/60 text-sm">{t.footer.weAccept}</span>
            <div className="flex gap-2">
              {["💳", "🏦", "💵"].map((emoji, i) => (
                <span key={i} className="text-xl">{emoji}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
