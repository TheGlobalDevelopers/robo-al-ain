import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAccount, customerPermissions } from "@/types/account";
import { SiteSettings } from "@/types/settings";
import { toast } from "sonner";
import { saveAccountHintCookies, saveLocationCookie } from "@/lib/cookies";
import { createAccount } from "@/lib/accountStore";

interface AccountRegisterPageProps {
  accounts: UserAccount[];
  onAccountsChange: (accounts: UserAccount[]) => void;
  settings: SiteSettings;
  onCurrentAccountChange: (accountId: number | null) => void;
}

const AccountRegisterPage = ({ accounts, onAccountsChange, settings, onCurrentAccountChange }: AccountRegisterPageProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Home");
  const [locationUrl, setLocationUrl] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    if (!fullName.trim() || (!email.trim() && !phone.trim())) {
      toast.error("Enter full name and either email or phone.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim().replace(/\D/g, "");
    const duplicate = accounts.some((account) => {
      const sameEmail = normalizedEmail && account.email.trim().toLowerCase() === normalizedEmail;
      const samePhone = normalizedPhone && account.phone.replace(/\D/g, "") === normalizedPhone;
      return sameEmail || samePhone;
    });
    if (duplicate) {
      toast.error("Account already exists for this email or phone. Please log in.");
      return;
    }

    const smsEnabled = Boolean(settings.integrations.smsApiKey.trim());
    const next: UserAccount = {
      id: Date.now(),
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: "customer",
      verified: !smsEnabled,
      verificationMethod: smsEnabled ? "sms" : "skipped",
      createdAt: new Date().toLocaleString(),
      permissions: customerPermissions,
      paymentHistory: [],
      savedCards: [],
    };

    const syncedAccounts = await createAccount(next);
    onAccountsChange(syncedAccounts);
    onCurrentAccountChange(next.id);
    saveAccountHintCookies(next.fullName, next.phone);
    setShowLocationPopup(true);

    if (smsEnabled && next.phone.trim()) {
      toast.success(`Verification SMS sent to ${next.phone}.`);
    } else {
      toast.info("SMS API unavailable. Verification skipped and account created.");
    }
  };

  const handleSaveLocation = () => {
    if (locationLabel.trim() && locationUrl.trim()) {
      saveLocationCookie(locationUrl.trim(), locationLabel.trim());
      toast.success("Location saved in cookies.");
    }
    setShowLocationPopup(false);
    navigate("/account");
  };

  return (
    <main className="min-h-screen bg-background grid place-items-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-muted-foreground">Register with email or phone.</p>
        <Input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <Input placeholder="Email (optional if phone provided)" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input placeholder="Phone (optional if email provided)" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Button className="w-full" onClick={register}>Register</Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/" className="text-primary underline">Back to home</Link>
          <Link to="/account/login" className="text-primary underline">Already have account?</Link>
        </div>
      </section>

      {showLocationPopup ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-card space-y-3">
            <h3 className="text-lg font-semibold">Save your delivery location</h3>
            <p className="text-sm text-muted-foreground">We save this in cookies for fast checkout on next visits.</p>
            <Input placeholder="Place label (Home, Work...)" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} />
            <Input placeholder="Google Maps URL or address" value={locationUrl} onChange={(event) => setLocationUrl(event.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleSaveLocation}>Skip</Button>
              <Button onClick={handleSaveLocation}>Save and continue</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default AccountRegisterPage;
