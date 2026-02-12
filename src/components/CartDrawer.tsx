import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/product";
import { Language, translations } from "@/lib/i18n";
import { getProductName, getProductUnit } from "@/lib/productLabels";
import { useNavigate } from "react-router-dom";

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

const CartDrawer = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, language }: CartDrawerProps) => {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-2xl flex flex-col">
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
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-medium text-foreground line-clamp-2 text-sm">{getProductName(language, item)}</h4>
                  <p className="text-xs text-muted-foreground">{getProductUnit(language, item)}</p>
                  <p className="font-bold text-primary mt-1">{item.price.toFixed(2)} AED</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 bg-card rounded-lg p-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.cart.subtotal}</span>
              <span className="font-medium text-foreground">{subtotal.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
              <span className="text-foreground">{t.cart.total}</span>
              <span className="text-primary">{total.toFixed(2)} AED</span>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-lg text-base font-semibold"
              onClick={() => {
                onClose();
                navigate("/cart?step=checkout");
              }}
            >
              {t.cart.checkout}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
