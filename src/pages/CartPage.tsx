import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types/product";
import { Order } from "@/types/order";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { loadAccountNameCookie, loadAccountPhoneCookie, loadLocationCookie, loadLocationLabelCookie, saveLocationCookie } from "@/lib/cookies";
import { SiteSettings } from "@/types/settings";
import { UserAccount } from "@/types/account";

interface CartPageProps {
  onCreateOrder: (order: Order) => void;
  settings: SiteSettings;
  currentAccount: UserAccount | null;
  items: CartItem[];
  onItemsChange: (items: CartItem[]) => void;
}

const parseMapCoordinates = (location: string) => {
  const match = location.match(/q=([-\d.]+),([-\d.]+)/);
  if (!match) return null;
  return { lat: match[1], lng: match[2] };
};

const maskCardLast4 = (cardNumber: string) => cardNumber.replace(/\D/g, "").slice(-4);

const CartPage = ({ onCreateOrder, settings, currentAccount, items, onItemsChange }: CartPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(currentAccount?.fullName ?? loadAccountNameCookie());
  const [phone, setPhone] = useState(currentAccount?.phone ?? loadAccountPhoneCookie());
  const [address, setAddress] = useState("");
  const [placeLabel, setPlaceLabel] = useState(loadLocationLabelCookie());
  const [location, setLocation] = useState(loadLocationCookie());
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [cardHolder, setCardHolder] = useState(currentAccount?.fullName ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!currentAccount) return;
    setCustomer(currentAccount.fullName);
    setPhone(currentAccount.phone);
    setCardHolder((prev) => prev || currentAccount.fullName);
  }, [currentAccount]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryFee = fulfillment === "delivery" ? 15 : 0;
  const activePromo = settings.promoCodes.find((promo) => promo.active && promo.code.toLowerCase() === promoCode.trim().toLowerCase());
  const promoDiscount = activePromo ? (subtotal * activePromo.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - promoDiscount);
  const mapCoords = parseMapCoordinates(location);

  useEffect(() => {
    if (searchParams.get("step") === "checkout") {
      document.getElementById("checkout-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const updateQty = (id: number, next: number) => {
    const updated = next <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, quantity: next } : item));
    onItemsChange(updated);
  };

  const maybeSaveLocationCookie = (url: string, label: string) => {
    if (!url.trim() || !label.trim()) return;
    saveLocationCookie(url, label);
    toast.success("Location saved in cookies.");
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapsValue = `https://www.google.com/maps?q=${lat},${lng}`;
        setLocation(mapsValue);
        if (placeLabel.trim()) {
          maybeSaveLocationCookie(mapsValue, placeLabel);
        }
      },
      () => toast.error("Unable to read location. Please allow permissions.")
    );
  };

  const cardLast4 = maskCardLast4(cardNumber);
  const isCardValid = paymentMethod !== "online" || (cardHolder.trim() && cardLast4.length === 4);
  const canCheckout =
    items.length > 0 &&
    customer.trim() &&
    phone.trim() &&
    (fulfillment === "pickup" || (location.trim() && placeLabel.trim())) &&
    isCardValid;

  const placeOrder = () => {
    if (!canCheckout) return;

    if (location.trim() && placeLabel.trim()) {
      saveLocationCookie(location, placeLabel);
    }

    const order: Order = {
      id: Date.now(),
      customer: customer.trim(),
      phone: phone.trim(),
      address: fulfillment === "delivery" ? `${placeLabel.trim()} - ${address.trim()}` : "Pickup",
      paymentMethod,
      fulfillment,
      items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
      total,
      date: new Date().toLocaleString(),
      source: "online",
      accountId: currentAccount?.id,
      promoCode: activePromo?.code,
      discountAmount: promoDiscount > 0 ? Number(promoDiscount.toFixed(2)) : undefined,
      cardHolder: paymentMethod === "online" ? cardHolder.trim() : undefined,
      cardLast4: paymentMethod === "online" ? cardLast4 : undefined,
      cardToken: paymentMethod === "online" ? btoa(cardNumber.replace(/\D/g, "")) : undefined,
    };
    onCreateOrder(order);
    onItemsChange([]);
    toast.success("Order sent to payout successfully.");
    navigate("/");
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Cart & Payout</h1>
      {currentAccount ? <p className="text-sm text-emerald-600">Signed in as {currentAccount.fullName}. Checkout will save to your account history.</p> : <p className="text-sm text-muted-foreground">Tip: sign in from Account page to save order history automatically.</p>}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-2xl p-5 space-y-4 shadow-card">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          {items.length === 0 ? <p className="text-muted-foreground">Your cart is empty.</p> : null}
          {items.map((item) => (
            <div key={item.id} className="border border-border rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">AED {item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => updateQty(item.id, item.quantity - 1)}>-</Button>
                <span className="w-7 text-center">{item.quantity}</span>
                <Button variant="outline" size="sm" onClick={() => updateQty(item.id, item.quantity + 1)}>+</Button>
              </div>
            </div>
          ))}
        </section>

        <section id="checkout-section" className="bg-card rounded-2xl p-5 space-y-4 shadow-card">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <Input placeholder="Customer Name" value={customer} onChange={(event) => setCustomer(event.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="flex gap-2 flex-wrap">
            <Button variant={fulfillment === "delivery" ? "default" : "outline"} onClick={() => setFulfillment("delivery")}>Delivery</Button>
            <Button variant={fulfillment === "pickup" ? "default" : "outline"} onClick={() => setFulfillment("pickup")}>Pickup</Button>
          </div>
          {fulfillment === "delivery" ? (
            <>
              <Input placeholder="Place Name (Home, Work...)" value={placeLabel} onChange={(event) => setPlaceLabel(event.target.value)} />
              <Input
                placeholder="Location (Google Maps URL or address)"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onBlur={() => maybeSaveLocationCookie(location, placeLabel)}
              />
              <div className="flex gap-2 flex-wrap">
                <Button type="button" variant="outline" onClick={getCurrentLocation}>Get my location from Google Maps</Button>
                <Button type="button" variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || "Al Ain")}`, "_blank")}>Choose location on map</Button>
              </div>
              {mapCoords ? (
                <div className="rounded-xl border border-border overflow-hidden">
                  <iframe title="Selected location map" src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}&z=15&output=embed`} className="w-full h-52" loading="lazy" />
                </div>
              ) : null}
              <Input placeholder="Address details" value={address} onChange={(event) => setAddress(event.target.value)} />
            </>
          ) : null}
          <div className="flex gap-2 flex-wrap">
            <Button variant={paymentMethod === "online" ? "default" : "outline"} onClick={() => setPaymentMethod("online")}>Online Payment</Button>
            <Button variant={paymentMethod === "cod" ? "default" : "outline"} onClick={() => setPaymentMethod("cod")}>Cash on Delivery</Button>
          </div>

          {paymentMethod === "online" ? (
            <div className="grid md:grid-cols-2 gap-2">
              <Input placeholder="Card holder name" value={cardHolder} onChange={(event) => setCardHolder(event.target.value)} />
              <Input placeholder="Card number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
            </div>
          ) : null}

          <div className="space-y-2">
            <Input placeholder="Promo code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} />
            {promoCode.trim() && !activePromo ? <p className="text-xs text-amber-600">Promo code not valid.</p> : null}
            {activePromo ? <p className="text-xs text-emerald-600">Promo applied: {activePromo.discountPercent}% off</p> : null}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>AED {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>AED {deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>- AED {promoDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>AED {total.toFixed(2)}</span></div>
          </div>

          <Button className="w-full" disabled={!canCheckout} onClick={placeOrder}>Continue to Payout</Button>
        </section>
      </div>
    </main>
  );
};

export default CartPage;
