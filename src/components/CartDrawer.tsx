import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/product";
import { Language, translations } from "@/lib/i18n";
import { getProductName, getProductUnit } from "@/lib/productLabels";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  language: Language;
  onCheckout: (payload: {
    customer: string;
    phone: string;
    address: string;
    paymentMethod: "online" | "cod";
    fulfillment: "delivery" | "pickup";
  }) => void;
}

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  language,
  onCheckout,
}: CartDrawerProps) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("05");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [fulfillment] = useState<"pickup">("pickup");
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const t = translations[language];

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setShowCheckoutForm(false);
      setCustomerName("");
      setPhone("05");
      setPaymentMethod("online");
    }
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10 && phoneDigits.startsWith("05");
  const isCheckoutValid =
    customerName.trim() &&
    isPhoneValid;

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const withPrefix = digits.startsWith("05") ? digits : `05${digits.replace(/^0+/, "")}`;
    setPhone(withPrefix.slice(0, 10));
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-foreground/50 z-50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t.cart.title}</h2>
            <span className="bg-primary text-primary-foreground text-sm px-2 py-0.5 rounded-full">
              {items.length} {t.cart.items}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t.cart.emptyTitle}</h3>
              <p className="text-muted-foreground">{t.cart.emptySubtitle}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-secondary/50 rounded-lg p-3">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground line-clamp-2 text-sm">
                    {getProductName(language, item)}
                  </h4>
                  <p className="text-xs text-muted-foreground">{getProductUnit(language, item)}</p>
                  <p className="font-bold text-primary mt-1">{item.price.toFixed(2)} AED</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 bg-card rounded-lg p-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className={`border-t border-border p-4 space-y-3 ${
              showCheckoutForm ? "max-h-[55vh] overflow-y-auto" : ""
            }`}
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.cart.subtotal}</span>
              <span className="font-medium text-foreground">{subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
              <span className="text-foreground">{t.cart.total}</span>
              <span className="text-primary">{total.toFixed(2)} AED</span>
            </div>
            {!showCheckoutForm && (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg text-base font-semibold"
                onClick={() => setShowCheckoutForm(true)}
              >
                {t.cart.checkout}
              </Button>
            )}
            {showCheckoutForm && (
              <div className="mt-4 rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3 max-h-72 overflow-y-auto pr-1">
                <div>
                  <div className="text-sm font-semibold">{t.cart.checkoutTitle}</div>
                  <div className="text-xs text-muted-foreground">{t.cart.fillCheckout}</div>
                </div>
                <Input
                  placeholder={t.cart.customerName}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <Input
                  placeholder={t.cart.phone}
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                />
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">{t.cart.paymentMethod}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "online" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setPaymentMethod("online")}
                    >
                      {t.cart.paymentOnline}
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "cod" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setPaymentMethod("cod")}
                    >
                      {t.cart.paymentCod}
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full rounded-full"
                  disabled={!isCheckoutValid}
                  onClick={() =>
                    onCheckout({
                      customer: customerName.trim(),
                      phone: phone.trim(),
                      address: "",
                      paymentMethod,
                      fulfillment,
                    })
                  }
                >
                  {t.cart.placeOrder}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
