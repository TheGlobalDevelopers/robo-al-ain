import { useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { roboLogoDataUrl } from "@/lib/brand";
import { Offer } from "@/types/offer";
import { SiteSettings } from "@/types/settings";
import { AdminNotification } from "@/types/notification";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Bell, Copy } from "lucide-react";

interface AdminProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  orders: Order[];
  offers: Offer[];
  onOffersChange: (offers: Offer[]) => void;
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
  notifications: AdminNotification[];
  onNotificationsChange: (notifications: AdminNotification[]) => void;
}

const menu = [
  { path: "/admin", label: { en: "Dashboard", ar: "لوحة التحكم" } },
  { path: "/admin/prices", label: { en: "Prices", ar: "الأسعار" } },
  { path: "/admin/offers", label: { en: "Offers", ar: "العروض" } },
  { path: "/admin/deals", label: { en: "Deals Editor", ar: "تعديل العروض" } },
  { path: "/admin/requests", label: { en: "Requests", ar: "الطلبات" } },
  { path: "/admin/integrations", label: { en: "API Settings", ar: "إعدادات API" } },
  { path: "/admin/cards", label: { en: "Saved Cards", ar: "البطاقات" } },
  { path: "/admin/notifications", label: { en: "Notifications", ar: "الإشعارات" } },
];

const labels = {
  en: { login: "Admin Sign In", user: "Username", pass: "Password", invalid: "Invalid login details.", signIn: "Sign In", addProduct: "Add New Product", save: "Save", signOut: "Sign out", lang: "العربية" },
  ar: { login: "دخول الإدارة", user: "اسم المستخدم", pass: "كلمة المرور", invalid: "بيانات الدخول غير صحيحة.", signIn: "دخول", addProduct: "إضافة منتج جديد", save: "حفظ", signOut: "تسجيل خروج", lang: "English" },
};

const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("Failed reading file"));
  reader.readAsDataURL(file);
});

const Admin = ({ products, onProductsChange, orders, offers, onOffersChange, settings, onSettingsChange, notifications, onNotificationsChange }: AdminProps) => {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showBell, setShowBell] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOffer, setNewOffer] = useState({ productId: "", title: "", description: "", discountPercent: "10" });
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image: "", unit: "", originalPrice: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.replace("/admin", "") || "/";
  const t = labels[language];

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      const date = new Date(order.id);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + order.total);
    });
    return Array.from(map.entries()).map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));
  }, [orders]);

  const weeklyData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      const date = new Date(order.id);
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const key = start.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + order.total);
    });
    return Array.from(map.entries()).map(([week, total]) => ({ week, total: Number(total.toFixed(2)) }));
  }, [orders]);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const cards = orders.filter((order) => Boolean(order.cardLast4));

  const addNotification = (message: string, type: AdminNotification["type"] = "system") => {
    onNotificationsChange([{ id: Date.now(), message, type, createdAt: new Date().toLocaleString(), read: false }, ...notifications]);
  };

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`Copied: ${value}`);
  };

  const handleLogin = () => {
    if (username === "admin" && password === "robo2026admin") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError(t.invalid);
    }
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.image || !newProduct.unit) {
      toast.error("Please complete all product fields.");
      return;
    }
    const nextId = Math.max(0, ...products.map((item) => item.id)) + 1;
    const price = Number(newProduct.price);
    const originalPrice = newProduct.originalPrice ? Number(newProduct.originalPrice) : null;

    onProductsChange([
      ...products,
      { id: nextId, name: newProduct.name, nameAr: newProduct.name, price: Number.isNaN(price) ? 0 : price, originalPrice: Number.isNaN(originalPrice) ? null : originalPrice, rating: 4.7, image: newProduct.image, category: newProduct.category, unit: newProduct.unit, inStock: true },
    ]);
    addNotification(`New product added: ${newProduct.name} (ID: ${nextId})`, "product");
    setNewProduct({ name: "", price: "", category: "", image: "", unit: "", originalPrice: "" });
  };

  const markAllRead = () => onNotificationsChange(notifications.map((item) => ({ ...item, read: true })));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="w-full max-w-md bg-card rounded-3xl shadow-card p-8 space-y-5 text-center">
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setLanguage((prev) => (prev === "en" ? "ar" : "en"))}>{t.lang}</Button>
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center"><img src={roboLogoDataUrl} alt="Robo Al Ain logo" className="w-16 h-16 object-contain" /></div>
          <h1 className="text-2xl font-bold">{t.login}</h1>
          <Input placeholder={t.user} value={username} onChange={(event) => setUsername(event.target.value)} />
          <Input placeholder={t.pass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
          <Button className="w-full" onClick={handleLogin}>{t.signIn}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => navigate("/")}><div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center overflow-hidden"><img src={roboLogoDataUrl} alt="Robo Al Ain logo" className="h-9 w-9 object-contain" /></div><div><div className="text-xl font-bold">Roboo Al Ain Admin</div><div className="text-sm text-muted-foreground">Live control panel</div></div></button>
          <div className="flex items-center gap-2 relative">
            <Button variant="outline" size="sm" onClick={() => setLanguage((prev) => (prev === "en" ? "ar" : "en"))}>{t.lang}</Button>
            <Button variant="outline" size="icon" onClick={() => setShowBell((prev) => !prev)} className="relative"><Bell className="h-4 w-4" />{unreadCount > 0 ? <span className="absolute -top-1 -right-1 text-[10px] bg-destructive text-white rounded-full px-1">{unreadCount}</span> : null}</Button>
            {showBell && <div className="absolute right-0 top-12 w-80 max-h-96 overflow-auto rounded-xl border border-border bg-card shadow-lg p-3 z-30">{notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notifications.</p> : notifications.slice(0, 8).map((item) => <div key={item.id} className="py-2 border-b border-border/50 last:border-b-0"><p className="text-sm font-medium">{item.message}</p><p className="text-xs text-muted-foreground">{item.createdAt}</p></div>)}<Button variant="outline" size="sm" className="w-full mt-2" onClick={markAllRead}>Mark all as read</Button></div>}
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="container mx-auto px-4 py-2 flex flex-wrap gap-2">
            {menu.map((item) => (
              <Link key={item.path} to={item.path} className={`px-3 py-2 rounded-full text-sm ${location.pathname === item.path ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                {item.label[language]}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {(section === "/" || section === "") && <section className="bg-card rounded-2xl p-6 shadow-card space-y-6"><h2 className="text-2xl font-bold">Dashboard Reports</h2><div className="grid md:grid-cols-3 gap-4"><div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></div><div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Active Offers</p><p className="text-2xl font-bold">{offers.filter((item) => item.active).length}</p></div><div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Products</p><p className="text-2xl font-bold">{products.length}</p></div></div><div className="grid xl:grid-cols-2 gap-6"><div className="h-72"><p className="font-semibold mb-2">Monthly Report</p><ResponsiveContainer width="100%" height="100%"><BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" /></BarChart></ResponsiveContainer></div><div className="h-72"><p className="font-semibold mb-2">Weekly Report</p><ResponsiveContainer width="100%" height="100%"><BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--accent))" /></BarChart></ResponsiveContainer></div></div></section>}

        {section === "/prices" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">{t.addProduct}</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2"><Input placeholder="Name" value={newProduct.name} onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} /><Input placeholder="Price" type="number" value={newProduct.price} onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} /><Input placeholder="Category (Fresh, Dairy...)" value={newProduct.category} onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))} /><Input placeholder="Image URL" value={newProduct.image} onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))} /><Input placeholder="Unit (1kg, each...)" value={newProduct.unit} onChange={(event) => setNewProduct((prev) => ({ ...prev, unit: event.target.value }))} /><Input placeholder="Original Price (optional)" type="number" value={newProduct.originalPrice} onChange={(event) => setNewProduct((prev) => ({ ...prev, originalPrice: event.target.value }))} /></div><Input type="file" accept="image/png,image/jpeg" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const data = await fileToDataUrl(file); setNewProduct((prev) => ({ ...prev, image: data })); }} /><Button onClick={addProduct}>{t.save}</Button><h3 className="text-xl font-semibold pt-2">Live Price Management + Product IDs</h3>{products.map((product) => <div key={product.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_160px_120px_160px] gap-2 items-center border border-border rounded-lg p-2"><div>{product.name}</div><Button type="button" variant="outline" size="sm" className="justify-between" onClick={() => copyText(String(product.id))}>ID #{product.id} <Copy className="h-4 w-4" /></Button><Input value={product.category} onChange={(event) => onProductsChange(products.map((item) => item.id === product.id ? { ...item, category: event.target.value } : item))} /><Input type="number" value={product.price} onChange={(event) => onProductsChange(products.map((item) => item.id === product.id ? { ...item, price: Number(event.target.value) } : item))} /><Input type="file" accept="image/png,image/jpeg" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const data = await fileToDataUrl(file); onProductsChange(products.map((item) => item.id === product.id ? { ...item, image: data } : item)); }} /><Button variant="outline" onClick={() => { addNotification(`Price updated for ${product.name}`, "product"); }}>Save</Button></div>)}</section>}

        {section === "/offers" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">Offers Page</h2><div className="grid md:grid-cols-2 gap-2"><Input placeholder="Offer title" value={newOffer.title} onChange={(event) => setNewOffer((prev) => ({ ...prev, title: event.target.value }))} /><Input placeholder="Product ID" value={newOffer.productId} onChange={(event) => setNewOffer((prev) => ({ ...prev, productId: event.target.value }))} /><Input placeholder="Discount %" type="number" value={newOffer.discountPercent} onChange={(event) => setNewOffer((prev) => ({ ...prev, discountPercent: event.target.value }))} /><Input placeholder="Description" value={newOffer.description} onChange={(event) => setNewOffer((prev) => ({ ...prev, description: event.target.value }))} /></div><Button onClick={() => { const parsedProductId = Number((newOffer.productId || "").replace(/[^0-9]/g, "")); const product = products.find((item) => item.id === parsedProductId); if (!parsedProductId || !newOffer.title.trim() || !product) { toast.error("Enter valid product ID (you can type like #12) and title."); return; } const nextOffer: Offer = { id: Date.now(), productId: parsedProductId, title: newOffer.title.trim(), description: newOffer.description, discountPercent: Number(newOffer.discountPercent || 0), active: true, createdAt: new Date().toLocaleString() }; onOffersChange([nextOffer, ...offers]); setNewOffer({ productId: "", title: "", description: "", discountPercent: "10" }); }}>Add offer</Button>{offers.map((offer) => <div key={offer.id} className="border border-border rounded-lg p-3 flex justify-between items-center gap-2"><div><p className="font-medium">{offer.title} ({offer.discountPercent}%)</p><p className="text-sm text-muted-foreground">Product #{offer.productId} - {offer.description}</p></div><Button variant={offer.active ? "outline" : "default"} onClick={() => onOffersChange(offers.map((item) => item.id === offer.id ? { ...item, active: !item.active } : item))}>{offer.active ? "Disable" : "Enable"}</Button></div>)}</section>}

        {section === "/deals" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">Deals Page Editor</h2><Input placeholder="Deals headline" value={settings.deals.headline} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, headline: event.target.value } })} /><Input placeholder="Deals subtitle" value={settings.deals.subtitle} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, subtitle: event.target.value } })} /><Input type="datetime-local" value={settings.deals.endAtIso ? new Date(settings.deals.endAtIso).toISOString().slice(0,16) : ""} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, endAtIso: event.target.value ? new Date(event.target.value).toISOString() : "" } })} /><Button onClick={() => addNotification("Deals page updated", "offer")}>Save deals settings</Button></section>}

        {section === "/requests" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">Requests</h2><div className="grid lg:grid-cols-[1fr_320px] gap-4"><div className="space-y-3">{orders.map((order) => <button key={order.id} type="button" className="w-full text-left border border-border rounded-xl p-3 hover:border-primary transition-colors" onClick={() => setSelectedOrder(order)}><div className="flex justify-between gap-2"><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.date}</p></div><p className="text-sm text-muted-foreground">{order.fulfillment} - {order.address}</p><p className="font-semibold mt-2">AED {order.total.toFixed(2)}</p></button>)}</div><div className="border border-border rounded-xl p-4 bg-secondary/30">{selectedOrder ? <div className="space-y-2 text-sm"><h3 className="font-bold text-base">Request details</h3><p><strong>Name:</strong> {selectedOrder.customer}</p><p><strong>Phone:</strong> {selectedOrder.phone || "-"}</p><p><strong>Address:</strong> {selectedOrder.address || "-"}</p><p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p><p><strong>Fulfillment:</strong> {selectedOrder.fulfillment}</p><p><strong>Total:</strong> AED {selectedOrder.total.toFixed(2)}</p></div> : <p className="text-sm text-muted-foreground">Click any request to see full data.</p>}</div></div></section>}

        {section === "/integrations" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">API Settings (Email / SMS / WhatsApp)</h2><Input placeholder="Email API key" value={settings.integrations.emailApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, emailApiKey: event.target.value } })} /><Input placeholder="SMS API key" value={settings.integrations.smsApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, smsApiKey: event.target.value } })} /><Input placeholder="WhatsApp API key" value={settings.integrations.whatsappApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, whatsappApiKey: event.target.value } })} /><Input placeholder="Payment gateway key" value={settings.integrations.paymentGatewayKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, paymentGatewayKey: event.target.value } })} /><Input placeholder="Webhook URL" value={settings.integrations.webhookUrl} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, webhookUrl: event.target.value } })} /></section>}

        {section === "/cards" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><h2 className="text-2xl font-bold">Saved Cards (masked)</h2>{cards.length ? cards.map((order) => <div key={order.id} className="border border-border rounded-lg p-3"><p className="font-medium">{order.cardHolder || order.customer}</p><p className="text-sm text-muted-foreground">**** **** **** {order.cardLast4}</p></div>) : <p className="text-muted-foreground">No online card payments yet.</p>}</section>}

        {section === "/notifications" && <section className="bg-card rounded-2xl p-6 shadow-card space-y-4"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Admin Notifications</h2><Button variant="outline" onClick={markAllRead}>Mark all as read</Button></div>{notifications.map((item) => <div key={item.id} className={`border rounded-lg p-3 ${item.read ? "border-border" : "border-primary"}`}><p className="font-medium">{item.message}</p><p className="text-sm text-muted-foreground">{item.createdAt}</p></div>)}</section>}
      </main>
    </div>
  );
};

export default Admin;
