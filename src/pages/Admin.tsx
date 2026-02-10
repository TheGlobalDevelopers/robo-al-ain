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
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/prices", label: "Prices" },
  { path: "/admin/offers", label: "Offers" },
  { path: "/admin/requests", label: "Requests" },
  { path: "/admin/integrations", label: "API Settings" },
  { path: "/admin/notifications", label: "Notifications" },
];

const Admin = ({
  products,
  onProductsChange,
  orders,
  offers,
  onOffersChange,
  settings,
  onSettingsChange,
  notifications,
  onNotificationsChange,
}: AdminProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [newOffer, setNewOffer] = useState({ productId: "", title: "", description: "", discountPercent: "10" });
  const navigate = useNavigate();
  const location = useLocation();

  const section = location.pathname.replace("/admin", "") || "/";

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

  const addNotification = (message: string, type: AdminNotification["type"] = "system") => {
    onNotificationsChange([
      { id: Date.now(), message, type, createdAt: new Date().toLocaleString(), read: false },
      ...notifications,
    ]);
  };

  const handleLogin = () => {
    if (username === "admin" && password === "robo2026admin") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid login details.");
    }
  };

  const downloadWeek = (week: string, total: number) => {
    const csv = `week,total\n${week},${total}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-report-${week}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markAllRead = () => {
    onNotificationsChange(notifications.map((item) => ({ ...item, read: true })));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <div className="bg-card rounded-2xl shadow-card p-8 space-y-4">
            <h1 className="text-2xl font-bold">Admin Sign In</h1>
            <Input placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
            <Button className="w-full" onClick={handleLogin}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center overflow-hidden"><img src={roboLogoDataUrl} alt="Robo Al Ain logo" className="h-9 w-9 object-contain" /></div>
            <div>
              <div className="text-xl font-bold">Roboo Al Ain Admin</div>
              <div className="text-sm text-muted-foreground">Live control panel</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>Back to site</Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Sign out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-card rounded-2xl p-4 shadow-card h-fit">
          <nav className="space-y-1">
            {menu.map((item) => (
              <Link key={item.path} to={item.path} className={`block rounded-lg px-3 py-2 text-sm ${location.pathname === item.path ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                {item.label}
                {item.path.includes("notifications") && unreadCount ? ` (${unreadCount})` : ""}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          {(section === "/" || section === "") && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <h2 className="text-2xl font-bold">Dashboard Reports</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></div>
                <div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Active Offers</p><p className="text-2xl font-bold">{offers.filter((item) => item.active).length}</p></div>
                <div className="rounded-xl bg-secondary p-4"><p className="text-sm text-muted-foreground">Products</p><p className="text-2xl font-bold">{products.length}</p></div>
              </div>
              <div className="grid xl:grid-cols-2 gap-6">
                <div className="h-72">
                  <p className="font-semibold mb-2">Monthly Report</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" /></BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-72">
                  <p className="font-semibold mb-2">Weekly Report</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Bar dataKey="total" fill="hsl(var(--accent))" /></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-2">
                {weeklyData.map((row) => (
                  <div key={row.week} className="flex items-center justify-between border border-border rounded-lg p-2">
                    <span>{row.week} - AED {row.total.toFixed(2)}</span>
                    <Button size="sm" variant="outline" onClick={() => downloadWeek(row.week, row.total)}>Download week</Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === "/prices" && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-3">
              <h2 className="text-2xl font-bold">Price Management</h2>
              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px] gap-2 items-center border border-border rounded-lg p-2">
                  <div>{product.name}</div>
                  <Input type="number" value={product.price} onChange={(event) => onProductsChange(products.map((item) => item.id === product.id ? { ...item, price: Number(event.target.value) } : item))} />
                  <Button variant="outline" onClick={() => { addNotification(`Price updated for ${product.name}`, "product"); toast.success("Price updated"); }}>Save</Button>
                </div>
              ))}
            </section>
          )}

          {section === "/offers" && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="text-2xl font-bold">Offers Page</h2>
              <div className="grid md:grid-cols-2 gap-2">
                <Input placeholder="Offer title" value={newOffer.title} onChange={(event) => setNewOffer((prev) => ({ ...prev, title: event.target.value }))} />
                <Input placeholder="Product ID" value={newOffer.productId} onChange={(event) => setNewOffer((prev) => ({ ...prev, productId: event.target.value }))} />
                <Input placeholder="Discount %" type="number" value={newOffer.discountPercent} onChange={(event) => setNewOffer((prev) => ({ ...prev, discountPercent: event.target.value }))} />
                <Input placeholder="Description" value={newOffer.description} onChange={(event) => setNewOffer((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
              <Button onClick={() => {
                const productId = Number(newOffer.productId);
                if (!productId || !newOffer.title.trim()) return;
                const nextOffer: Offer = { id: Date.now(), productId, title: newOffer.title, description: newOffer.description, discountPercent: Number(newOffer.discountPercent || 0), active: true, createdAt: new Date().toLocaleString() };
                onOffersChange([nextOffer, ...offers]);
                addNotification(`New offer created: ${nextOffer.title}`, "offer");
                setNewOffer({ productId: "", title: "", description: "", discountPercent: "10" });
              }}>Add offer</Button>
              {offers.map((offer) => (
                <div key={offer.id} className="border border-border rounded-lg p-3 flex justify-between items-center gap-2">
                  <div>
                    <p className="font-medium">{offer.title} ({offer.discountPercent}%)</p>
                    <p className="text-sm text-muted-foreground">Product #{offer.productId} - {offer.description}</p>
                  </div>
                  <Button variant={offer.active ? "outline" : "default"} onClick={() => {
                    onOffersChange(offers.map((item) => item.id === offer.id ? { ...item, active: !item.active } : item));
                    addNotification(`Offer ${offer.active ? "disabled" : "enabled"}: ${offer.title}`, "offer");
                  }}>{offer.active ? "Disable" : "Enable"}</Button>
                </div>
              ))}
            </section>
          )}

          {section === "/requests" && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="text-2xl font-bold">Requests</h2>
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-xl p-3">
                  <div className="flex justify-between gap-2"><p className="font-medium">{order.customer}</p><p className="text-sm text-muted-foreground">{order.date}</p></div>
                  <p className="text-sm text-muted-foreground">{order.fulfillment} - {order.address}</p>
                  <p className="font-semibold mt-2">AED {order.total.toFixed(2)}</p>
                </div>
              ))}
            </section>
          )}

          {section === "/integrations" && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <h2 className="text-2xl font-bold">Admin API Settings</h2>
              <p className="text-sm text-muted-foreground">You can save up to large values here (suitable for long keys and configs).</p>
              <Input placeholder="Email API key" value={settings.integrations.emailApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, emailApiKey: event.target.value } })} />
              <Input placeholder="Payment gateway key" value={settings.integrations.paymentGatewayKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, paymentGatewayKey: event.target.value } })} />
              <Input placeholder="SMS API key" value={settings.integrations.smsApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, smsApiKey: event.target.value } })} />
              <Input placeholder="Webhook URL" value={settings.integrations.webhookUrl} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, webhookUrl: event.target.value } })} />
              <Button onClick={() => addNotification("Integration settings updated", "system")}>Save API settings</Button>
            </section>
          )}

          {section === "/notifications" && (
            <section className="bg-card rounded-2xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Admin Notifications</h2><Button variant="outline" onClick={markAllRead}>Mark all as read</Button></div>
              {notifications.map((item) => (
                <div key={item.id} className={`border rounded-lg p-3 ${item.read ? "border-border" : "border-primary"}`}>
                  <p className="font-medium">{item.message}</p>
                  <p className="text-sm text-muted-foreground">{item.createdAt}</p>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
