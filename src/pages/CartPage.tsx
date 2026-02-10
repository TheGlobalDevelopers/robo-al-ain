import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types/product";
import { loadCartItems, saveCartItems } from "@/lib/cartStore";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CartPageProps {
  onCreateOrder: (order: Order) => void;
}

const CartPage = ({ onCreateOrder }: CartPageProps) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(loadCartItems());
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const deliveryFee = fulfillment === "delivery" ? 15 : 0;
  const total = subtotal + deliveryFee;

  const updateQty = (id: number, next: number) => {
    const updated = next <= 0 ? items.filter((item) => item.id !== id) : items.map((item) => (item.id === id ? { ...item, quantity: next } : item));
    setItems(updated);
    saveCartItems(updated);
  };

  const canCheckout = items.length > 0 && customer.trim() && phone.trim() && (fulfillment === "pickup" || location.trim());

  const placeOrder = () => {
    if (!canCheckout) return;
    const order: Order = {
      id: Date.now(),
      customer: customer.trim(),
      phone: phone.trim(),
      address: fulfillment === "delivery" ? `${location.trim()} - ${address.trim()}` : "Pickup",
      paymentMethod,
      fulfillment,
      items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
      total,
      date: new Date().toLocaleString(),
      source: "online",
    };
    onCreateOrder(order);
    setItems([]);
    saveCartItems([]);
    toast.success("Order sent to payout successfully.");
    navigate("/");
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Cart & Payout</h1>
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

        <section className="bg-card rounded-2xl p-5 space-y-4 shadow-card">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <Input placeholder="Customer Name" value={customer} onChange={(event) => setCustomer(event.target.value)} />
          <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <div className="flex gap-2 flex-wrap">
            <Button variant={fulfillment === "delivery" ? "default" : "outline"} onClick={() => setFulfillment("delivery")}>Delivery</Button>
            <Button variant={fulfillment === "pickup" ? "default" : "outline"} onClick={() => setFulfillment("pickup")}>Pickup</Button>
          </div>
          {fulfillment === "delivery" ? (
            <>
              <Input placeholder="Location (required before payment)" value={location} onChange={(event) => setLocation(event.target.value)} />
              <Input placeholder="Address details" value={address} onChange={(event) => setAddress(event.target.value)} />
            </>
          ) : null}
          <div className="flex gap-2 flex-wrap">
            <Button variant={paymentMethod === "online" ? "default" : "outline"} onClick={() => setPaymentMethod("online")}>Online Payment</Button>
            <Button variant={paymentMethod === "cod" ? "default" : "outline"} onClick={() => setPaymentMethod("cod")}>Cash on Delivery</Button>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>AED {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>AED {deliveryFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>AED {total.toFixed(2)}</span></div>
          </div>

          <Button className="w-full" disabled={!canCheckout} onClick={placeOrder}>Continue to Payout</Button>
        </section>
      </div>
    </main>
  );
};

export default CartPage;
