import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAccount } from "@/types/account";
import { toast } from "sonner";
import { saveAccountHintCookies } from "@/lib/cookies";

interface AccountLoginPageProps {
  accounts: UserAccount[];
  onCurrentAccountChange: (accountId: number | null) => void;
}

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const AccountLoginPage = ({ accounts, onCurrentAccountChange }: AccountLoginPageProps) => {
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const login = () => {
    const normalized = identifier.trim().toLowerCase();
    const user = accounts.find((account) => {
      if (account.email && account.email.toLowerCase() === normalized) return true;
      return normalizePhone(account.phone) === normalizePhone(normalized);
    });

    if (!user) {
      toast.error("No account found. Create one first.");
      return;
    }

    onCurrentAccountChange(user.id);
    saveAccountHintCookies(user.fullName, user.phone);
    toast.success(`Welcome back ${user.fullName}`);
    navigate("/account");
  };

  return (
    <main className="min-h-screen bg-background grid place-items-center p-4">
      <section className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card space-y-4">
        <h1 className="text-2xl font-bold">Account Login</h1>
        <p className="text-sm text-muted-foreground">Use your email or phone to continue.</p>
        <Input
          placeholder="Email or phone"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && login()}
        />
        <Button className="w-full" onClick={login}>Login</Button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/" className="text-primary underline">Back to home</Link>
          <Link to="/account/register" className="text-primary underline">Create account</Link>
        </div>
      </section>
    </main>
  );
};

export default AccountLoginPage;
