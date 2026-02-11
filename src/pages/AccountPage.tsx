import { useMemo, useState } from "react";
import { UserAccount, customerPermissions, fullAdminPermissions } from "@/types/account";
import { Order } from "@/types/order";
import { SiteSettings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AccountPageProps {
  accounts: UserAccount[];
  onAccountsChange: (accounts: UserAccount[]) => void;
  orders: Order[];
  settings: SiteSettings;
}

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const AccountPage = ({ accounts, onAccountsChange, orders, settings }: AccountPageProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentId, setCurrentId] = useState<number | null>(null);

  const currentAccount = useMemo(
    () => accounts.find((account) => account.id === currentId) ?? null,
    [accounts, currentId]
  );

  const accountOrders = useMemo(() => {
    if (!currentAccount) return [] as Order[];
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
    setCurrentId(next.id);

    if (smsEnabled && next.phone.trim()) {
      toast.success(`Verification SMS sent to ${next.phone}. Click verify to complete.`);
    } else {
      toast.info("SMS API unavailable. Verification skipped and account created.");
    }

    setFullName("");
    setEmail("");
    setPhone("");
  };

  const signIn = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const user = accounts.find((account) => {
      if (account.email && account.email.toLowerCase() === normalized) return true;
      return normalizePhone(account.phone) === normalizePhone(normalized);
    });

    if (!user) {
      toast.error("No account found. Create one first.");
      return;
    }

    setCurrentId(user.id);
    toast.success(`Welcome back ${user.fullName}`);
  };

  const verifyCurrent = () => {
    if (!currentAccount) return;
    if (currentAccount.verified) {
      toast.info("Account is already verified.");
      return;
    }

    onAccountsChange(
      accounts.map((account) =>
        account.id === currentAccount.id ? { ...account, verified: true } : account
      )
    );
    toast.success("SMS verification completed.");
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">My Account</h1>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <h2 className="text-xl font-semibold">Create account</h2>
          <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          <Input placeholder="Email (optional if phone provided)" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input placeholder="Phone (optional if email provided)" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Button onClick={create}>Create account</Button>
          <p className="text-xs text-muted-foreground">
            Verification uses SMS API if configured by admin. If no SMS API exists, account is created instantly.
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card space-y-3">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <Input placeholder="Email or phone" onKeyDown={(event) => {
            if (event.key === "Enter") {
              signIn((event.target as HTMLInputElement).value);
            }
          }} />
          <p className="text-xs text-muted-foreground">Press Enter after typing email or phone.</p>
        </div>
      </section>

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

          <div>
            <h3 className="font-semibold mb-2">Account permissions</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {Object.entries(currentAccount.permissions).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border p-2 flex justify-between">
                  <span>{key}</span>
                  <span className={value ? "text-emerald-600" : "text-muted-foreground"}>{value ? "Allowed" : "Blocked"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-card rounded-2xl p-5 shadow-card space-y-3">
        <h2 className="text-xl font-semibold">Staff accounts managed by admin</h2>
        {accounts.filter((account) => account.role === "admin").length ? (
          accounts
            .filter((account) => account.role === "admin")
            .map((account) => (
              <div key={account.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{account.fullName}</p>
                <p className="text-muted-foreground">{account.email || account.phone}</p>
                <p className="text-xs mt-1">Orders: {account.permissions.canViewOrders ? "Yes" : "No"} • Profits: {account.permissions.canViewProfits ? "Yes" : "No"} • Cards: {account.permissions.canViewCards ? "Yes" : "No"}</p>
              </div>
            ))
        ) : (
          <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
        )}
        <p className="text-xs text-muted-foreground">Master owner still keeps full permissions: {JSON.stringify(fullAdminPermissions)}.</p>
      </section>
    </main>
  );
};

export default AccountPage;
