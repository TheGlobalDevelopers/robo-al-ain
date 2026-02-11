import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserAccount } from "@/types/account";
import { Order } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Home, MapPin, Package, RotateCcw, ShieldCheck, UserCircle2 } from "lucide-react";

interface AccountPageProps {
  accounts: UserAccount[];
  onAccountsChange: (accounts: UserAccount[]) => void;
  orders: Order[];
  currentAccountId: number | null;
  onCurrentAccountChange: (accountId: number | null) => void;
}

type SectionKey = "orders" | "addresses" | "payments" | "returns" | "warranty" | "profile";

const normalizePhone = (value: string) => value.replace(/\D/g, "");
const cardBrand = (input: string) => {
  if (input.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(input)) return "Mastercard";
  return "Card";
};

const AccountPage = ({ accounts, onAccountsChange, orders, currentAccountId, onCurrentAccountChange }: AccountPageProps) => {
  const [activeSection, setActiveSection] = useState<SectionKey>("orders");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressValue, setAddressValue] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const navigate = useNavigate();

  const currentAccount = useMemo(
    () => accounts.find((account) => account.id === currentAccountId) ?? null,
    [accounts, currentAccountId]
  );

  const accountOrders = useMemo(() => {
    if (!currentAccount) return [] as Order[];
    const byId = orders.filter((order) => order.accountId === currentAccount.id);
    if (byId.length) return byId;
    const phoneMatch = normalizePhone(currentAccount.phone);
    return orders.filter((order) => normalizePhone(order.phone) === phoneMatch);
  }, [currentAccount, orders]);

  const signOut = () => {
    onCurrentAccountChange(null);
    navigate("/account/login");
  };

  const saveAddressCookie = () => {
    if (!addressLabel.trim() || !addressValue.trim()) {
      toast.error("Enter address label and value.");
      return;
    }
    document.cookie = `robo_saved_address=${encodeURIComponent(`${addressLabel.trim()}: ${addressValue.trim()}`)}; path=/; SameSite=Lax`;
    toast.success("Address saved in cookies.");
    setAddressValue("");
  };

  const addCard = () => {
    if (!currentAccount || !cardHolder.trim() || cardNumber.replace(/\D/g, "").length < 12) {
      toast.error("Enter valid card holder and card number.");
      return;
    }
    const number = cardNumber.replace(/\D/g, "");
    const last4 = number.slice(-4);
    const exists = currentAccount.savedCards.some((card) => card.last4 === last4);
    if (exists) {
      toast.info("Card already exists.");
      return;
    }

    onAccountsChange(
      accounts.map((account) =>
        account.id === currentAccount.id
          ? {
              ...account,
              savedCards: [
                {
                  id: Date.now(),
                  holder: cardHolder.trim(),
                  last4,
                  brand: cardBrand(number),
                  addedAt: new Date().toLocaleString(),
                },
                ...account.savedCards,
              ],
            }
          : account
      )
    );

    toast.success("Card added successfully.");
    setCardHolder("");
    setCardNumber("");
  };

  if (!currentAccount) {
    return (
      <main className="min-h-screen bg-background grid place-items-center p-4">
        <section className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-card space-y-4 text-center">
          <UserCircle2 className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Your Account</h1>
          <p className="text-sm text-muted-foreground">Please login or register to view orders, addresses, payments, and profile.</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => navigate("/account/login")}>Login</Button>
            <Button variant="outline" onClick={() => navigate("/account/register")}>Register</Button>
          </div>
          <Link to="/" className="text-primary underline text-sm inline-block">Return to home</Link>
        </section>
      </main>
    );
  }

  const sections: Array<{ key: SectionKey; label: string; icon: JSX.Element }> = [
    { key: "orders", label: "Orders", icon: <Package className="h-4 w-4" /> },
    { key: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
    { key: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
    { key: "returns", label: "Returns", icon: <RotateCcw className="h-4 w-4" /> },
    { key: "warranty", label: "Warranty Claims", icon: <ShieldCheck className="h-4 w-4" /> },
    { key: "profile", label: "Profile", icon: <UserCircle2 className="h-4 w-4" /> },
  ];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid gap-4 md:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl bg-card shadow-card p-3 border border-border">
          <div className="bg-primary/10 rounded-xl p-3 mb-3">
            <p className="font-semibold">Hello {currentAccount.fullName.split(" ")[0]}!</p>
            <p className="text-xs text-muted-foreground">{currentAccount.email || currentAccount.phone}</p>
          </div>
          <nav className="space-y-1">
            {sections.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${activeSection === item.key ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 pt-3 border-t border-border space-y-2">
            <Button variant="outline" className="w-full" onClick={() => navigate("/")}><Home className="h-4 w-4 mr-1" />Return Home</Button>
            <Button variant="destructive" className="w-full" onClick={signOut}>Sign Out</Button>
          </div>
        </aside>

        <section className="rounded-2xl bg-card shadow-card border border-border p-5 space-y-4">
          {activeSection === "orders" ? (
            <>
              <h2 className="text-xl font-bold">Orders</h2>
              {accountOrders.length ? accountOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border p-3 flex justify-between text-sm">
                  <span>#{order.id} • {order.date}</span>
                  <span className="font-semibold">AED {order.total.toFixed(2)}</span>
                </div>
              )) : <p className="text-sm text-muted-foreground">No orders yet.</p>}
            </>
          ) : null}

          {activeSection === "addresses" ? (
            <>
              <h2 className="text-xl font-bold">Addresses</h2>
              <Input placeholder="Label (Home, Work...)" value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} />
              <Input placeholder="Address or map URL" value={addressValue} onChange={(event) => setAddressValue(event.target.value)} />
              <Button onClick={saveAddressCookie}>Save address cookie</Button>
              <p className="text-xs text-muted-foreground">Saved as cookie for quick checkout autofill.</p>
            </>
          ) : null}

          {activeSection === "payments" ? (
            <>
              <h2 className="text-xl font-bold">Payments</h2>
              <div className="grid gap-2 md:grid-cols-2">
                <Input placeholder="Card holder" value={cardHolder} onChange={(event) => setCardHolder(event.target.value)} />
                <Input placeholder="Card number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
              </div>
              <Button onClick={addCard}>Add card</Button>
              <div className="space-y-2">
                {currentAccount.savedCards.length ? currentAccount.savedCards.map((card) => (
                  <div key={card.id} className="rounded-lg border border-border p-3 text-sm">
                    {card.brand} • **** {card.last4} • {card.holder}
                  </div>
                )) : <p className="text-sm text-muted-foreground">No saved cards yet.</p>}
              </div>
            </>
          ) : null}

          {activeSection === "returns" ? <><h2 className="text-xl font-bold">Returns</h2><p className="text-sm text-muted-foreground">Return center will appear here for eligible orders.</p></> : null}
          {activeSection === "warranty" ? <><h2 className="text-xl font-bold">Warranty Claims</h2><p className="text-sm text-muted-foreground">Track warranty and service requests here.</p></> : null}
          {activeSection === "profile" ? <><h2 className="text-xl font-bold">Profile</h2><p className="text-sm">Name: {currentAccount.fullName}</p><p className="text-sm">Email: {currentAccount.email || "-"}</p><p className="text-sm">Phone: {currentAccount.phone || "-"}</p></> : null}
        </section>
      </div>
    </main>
  );
};

export default AccountPage;
