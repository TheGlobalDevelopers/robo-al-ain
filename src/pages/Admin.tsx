import { useState } from "react";
import AdminPanel from "@/components/AdminPanel";
import { Language } from "@/lib/i18n";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";
import { roboLogoDataUrl } from "@/lib/brand";

interface AdminProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  onSaveProducts: () => void;
  productsSyncEnabled: boolean;
  ordersSyncEnabled: boolean;
}

const Admin = ({
  products,
  orders,
  onProductsChange,
  onOrdersChange,
  onSaveProducts,
  productsSyncEnabled,
  ordersSyncEnabled,
}: AdminProps) => {
  const [language, setLanguage] = useState<Language>("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const navigate = useNavigate();

  const labels = {
    title: language === "ar" ? "لوحة الإدارة" : "Admin Panel",
    subtitle: language === "ar" ? "إدارة المتجر" : "Store Management",
    loginTitle: language === "ar" ? "تسجيل الدخول" : "Sign In",
    loginSubtitle: language === "ar" ? "قم بتسجيل الدخول للوصول" : "Log in to access the admin tools.",
    username: language === "ar" ? "اسم المستخدم" : "Username",
    password: language === "ar" ? "كلمة المرور" : "Password",
    signIn: language === "ar" ? "دخول" : "Sign In",
    invalid: language === "ar" ? "بيانات الدخول غير صحيحة." : "Invalid login details.",
  };

  const handleLogin = () => {
    if (username === "admin" && password === "robo2026admin") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError(labels.invalid);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setAuthError("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              <img
                src={roboLogoDataUrl}
                alt="Robo Al Ain logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">Robo Al Ain Admin</div>
              <div className="text-sm text-muted-foreground">{labels.subtitle}</div>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setLanguage((prev) => (prev === "en" ? "ar" : "en"))}
          >
            {language === "ar" ? "English" : "العربية"}
          </Button>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto bg-card rounded-2xl shadow-card p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{labels.loginTitle}</h2>
              <p className="text-sm text-muted-foreground">{labels.loginSubtitle}</p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder={labels.username}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <Input
                placeholder={labels.password}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {authError ? <div className="text-sm text-destructive">{authError}</div> : null}
              <Button className="w-full rounded-full" onClick={handleLogin}>
                {labels.signIn}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <AdminPanel
          language={language}
          products={products}
          orders={orders}
          onProductsChange={onProductsChange}
          onOrdersChange={onOrdersChange}
          onSaveProducts={onSaveProducts}
          onSignOut={handleSignOut}
          productsSyncEnabled={productsSyncEnabled}
          ordersSyncEnabled={ordersSyncEnabled}
        />
      )}
    </div>
  );
};

export default Admin;
