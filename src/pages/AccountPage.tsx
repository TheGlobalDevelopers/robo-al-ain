import { useMemo, useState } from "react";
import { UserAccount, customerPermissions } from "@/types/account";
import { Order } from "@/types/order";
import { SiteSettings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveLocationCookie } from "@/lib/cookies";

interface AccountPageProps {
  accounts: UserAccount[];
  onAccountsChange: (accounts: UserAccount[]) => void;
  orders: Order[];
  settings: SiteSettings;
  currentAccountId: number | null;
  onCurrentAccountChange: (accountId: number | null) => void;
}

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const AccountPage = ({
  accounts,
  onAccountsChange,
  orders,
  settings,
  currentAccountId,
  onCurrentAccountChange,
}: AccountPageProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Home");
  const [locationUrl, setLocationUrl] = useState("");

  const currentAccount = useMemo(
    () => accounts.find((account) => account.id === currentAccountId) ?? null,
    [accounts, currentAccountId]
  );

  const accountOrders = useMemo(() => {
    if (!currentAccount) return [] as Order[];
    if (currentAccount.id) {
      const explicit = orders.filter((order) => order.accountId === currentAccount.id);
      if (explicit.length) return explicit;
    }
    const phoneMatch = normalizePhone(currentAccount.phone);
    return orders.filter((order) => normalizePhone(order.phone) === phoneMatch);
  }, [currentAccount, orders]);

  const create = () => {
    if (!fullName.trim() || (!email.trim() && !phone.trim())) {
      toast.error("Enter full name and either email or phone.");
      return;
    }

    const smsEnabled = Boolean(settings.integrations.smsApiKey.trim());
    const next: UserAccount = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: "customer",
      verified: !smsEnabled,
      verificationMethod: smsEnabled ? "sms" : "skipped",
      createdAt: new Date().toLocaleString(),
      permissions: customerPermissions,
      paymentHistory: [],
      savedCards: [],
    };

    onAccountsChange([next, ...accounts]);
    onCurrentAccountChange(next.id);
    setShowLocationPopup(true);

    if (smsEnabled && next.phone.trim()) {
      toast.success(`Verification SMS sent to ${next.phone}.`);
    } else {
      toast.info("SMS API unavailable. Verification skipped and account created.");
    }

    setFullName("");
    setEmail("");
    setPhone("");
  };

  const signIn = () => {
    const normalized = loginValue.trim().toLowerCase();
    const user = accounts.find((account) => {
      if (account.email && account.email.toLowerCase() === normalized) return true;
      return normalizePhone(account.phone) === normalizePhone(normalized);
    });

    if (!user) {
      toast.error("No account found. Create one first.");
      return;
    }

    onCurrentAccountChange(user.id);
    toast.success(`Welcome back ${user.fullName}`);
  };

  const verifyCurrent = () => {
    if (!currentAccount || currentAccount.verified) return;
    onAccountsChange(
      accounts.map((account) =>
        account.id === currentAccount.id ? { ...account, verified: true } : account
      )
    );
    toast.success("SMS verification completed.");
  };

  const savePreferredLocation = () => {
    if (!locationLabel.trim() || !locationUrl.trim()) {
      setShowLocationPopup(false);
      return;
    }
    saveLocationCookie(locationUrl.trim(), locationLabel.trim());
    toast.success("Location saved for faster checkout.");
    setShowLocationPopup(false);
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Account</h1>
        {currentAccount ? (
          <Button variant="outline" onClick={() => onCurrentAccountChange(null)}>Sign out</Button>
        ) : null}
      </div>

      {!currentAccount ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
            <h2 className="text-xl font-semibold">Create account</h2>
            <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            <Input placeholder="Email (optional if phone provided)" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input placeholder="Phone (optional if email provided)" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <Button onClick={create}>Create account</Button>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <Input
              placeholder="Email or phone"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && signIn()}
            />
            <Button variant="outline" onClick={signIn}>Sign in</Button>
          </div>
        </section>
      ) : null}

      {currentAccount ? (
        <section className="bg-card rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{currentAccount.fullName}</h2>
              <p className="text-sm text-muted-foreground">
                {currentAccount.email || currentAccount.phone} • {currentAccount.verified ? "Verified" : "Pending verification"}
              </p>
            </div>
            {!currentAccount.verified && currentAccount.verificationMethod === "sms" ? (
              <Button onClick={verifyCurrent}>Verify by SMS</Button>
            ) : null}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Payment history</h3>
            {accountOrders.length ? (
              <div className="space-y-2">
                {accountOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-border p-3 text-sm flex items-center justify-between">
                    <span>#{order.id} • {order.date}</span>
                    <span className="font-semibold">AED {order.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No orders linked yet.</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Saved cards</h3>
            {currentAccount.savedCards.length ? (
              <div className="space-y-2">
                {currentAccount.savedCards.map((card) => (
                  <div key={card.id} className="rounded-lg border border-border p-3 text-sm">
                    {card.brand} • **** {card.last4} • {card.holder}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No saved cards yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {showLocationPopup ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-card space-y-3">
            <h3 className="text-lg font-semibold">Save your location?</h3>
            <p className="text-sm text-muted-foreground">We will store this in cookies for faster checkout next time.</p>
            <Input placeholder="Place label (Home, Work...)" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} />
            <Input placeholder="Google Maps URL or address" value={locationUrl} onChange={(event) => setLocationUrl(event.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLocationPopup(false)}>Skip</Button>
              <Button onClick={savePreferredLocation}>Save location</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default AccountPage;
