import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Copy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { Offer } from "@/types/offer";
import { SiteSettings } from "@/types/settings";
import { AdminNotification } from "@/types/notification";
import { UserAccount, customerPermissions, fullAdminPermissions } from "@/types/account";
import { roboLogoDataUrl } from "@/lib/brand";

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
  accounts: UserAccount[];
  onAccountsChange: (accounts: UserAccount[]) => void;
}

const menu = [
  { path: "/admin", label: "Dashboard" },
  { path: "/admin/prices", label: "Prices" },
  { path: "/admin/offers", label: "Offers" },
  { path: "/admin/promos", label: "Promo Codes" },
  { path: "/admin/deals", label: "Deals Editor" },
  { path: "/admin/requests", label: "Requests" },
  { path: "/admin/integrations", label: "API Settings" },
  { path: "/admin/cards", label: "Saved Cards" },
  { path: "/admin/notifications", label: "Notifications" },
  { path: "/admin/accounts", label: "Customer Accounts" },
  { path: "/admin/team", label: "Team Permissions" },
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
  accounts,
  onAccountsChange,
}: AdminProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newOffer, setNewOffer] = useState({ productId: "", title: "", description: "", discountPercent: "10" });
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image: "", unit: "", originalPrice: "" });
  const [newStaff, setNewStaff] = useState({ fullName: "", email: "", phone: "", canViewOrders: true, canViewProfits: false, canViewCards: false });
  const [newPromo, setNewPromo] = useState({ code: "", discountPercent: "10" });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.replace("/admin", "") || "/";

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const savedCards = orders.filter((order) => Boolean(order.cardLast4));

  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((order) => {
      const date = new Date(order.id);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + order.total);
    });
    return Array.from(map.entries()).map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));
  }, [orders]);

  const copyText = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`Copied: ${value}`);
  };

  const addNotification = (message: string, type: AdminNotification["type"] = "system") => {
    onNotificationsChange([{ id: Date.now(), message, type, createdAt: new Date().toLocaleString(), read: false }, ...notifications]);
  };

  const markAllRead = () => {
    onNotificationsChange(notifications.map((item) => ({ ...item, read: true })));
  };

  const login = () => {
    if (username === "admin" && password === "robo2026admin") {
      setIsAuthenticated(true);
      return;
    }
    toast.error("Invalid admin credentials.");
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.unit) {
      toast.error("Complete required product fields.");
      return;
    }

    const nextId = Math.max(0, ...products.map((item) => item.id)) + 1;
    onProductsChange([
      ...products,
      {
        id: nextId,
        name: newProduct.name,
        nameAr: newProduct.name,
        price: Number(newProduct.price) || 0,
        originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
        rating: 4.7,
        image: newProduct.image || "",
        category: newProduct.category,
        unit: newProduct.unit,
        inStock: true,
      },
    ]);
    setNewProduct({ name: "", price: "", category: "", image: "", unit: "", originalPrice: "" });
    addNotification("New product added", "system");
  };

  const createOffer = () => {
    const productId = Number((newOffer.productId || "").replace(/[^0-9]/g, ""));
    const product = products.find((item) => item.id === productId);
    if (!product || !newOffer.title.trim()) {
      toast.error("Enter valid product ID and title.");
      return;
    }

    const nextOffer: Offer = {
      id: Date.now(),
      productId,
      title: newOffer.title.trim(),
      description: newOffer.description.trim(),
      discountPercent: Number(newOffer.discountPercent || 0),
      active: true,
      createdAt: new Date().toLocaleString(),
    };
    onOffersChange([nextOffer, ...offers]);
    setNewOffer({ productId: "", title: "", description: "", discountPercent: "10" });
  };


  const createPromo = () => {
    if (!newPromo.code.trim()) {
      toast.error("Enter promo code.");
      return;
    }
    const discount = Number(newPromo.discountPercent || 0);
    if (!discount || discount <= 0 || discount > 90) {
      toast.error("Discount must be between 1 and 90.");
      return;
    }

    onSettingsChange({
      ...settings,
      promoCodes: [
        {
          id: Date.now(),
          code: newPromo.code.trim().toUpperCase(),
          discountPercent: discount,
          active: true,
          createdAt: new Date().toLocaleString(),
        },
        ...settings.promoCodes.filter((item) => item.code.toUpperCase() !== newPromo.code.trim().toUpperCase()),
      ],
    });
    setNewPromo({ code: "", discountPercent: "10" });
    addNotification("Promo code created", "offer");
  };

  const createStaff = () => {
    if (!newStaff.fullName.trim() || (!newStaff.email.trim() && !newStaff.phone.trim())) {
      toast.error("Provide staff name and email or phone.");
      return;
    }

    const next: UserAccount = {
      id: Date.now(),
      fullName: newStaff.fullName.trim(),
      email: newStaff.email.trim().toLowerCase(),
      phone: newStaff.phone.trim(),
      role: "admin",
      verified: true,
      verificationMethod: "skipped",
      createdAt: new Date().toLocaleString(),
      paymentHistory: [],
      savedCards: [],
      permissions: {
        ...customerPermissions,
        canViewOrders: newStaff.canViewOrders,
        canViewProfits: newStaff.canViewProfits,
        canViewCards: newStaff.canViewCards,
        canManageProducts: true,
        canManageOffers: true,
        canManageUsers: false,
      },
    };

    onAccountsChange([next, ...accounts]);
    setNewStaff({ fullName: "", email: "", phone: "", canViewOrders: true, canViewProfits: false, canViewCards: false });
    addNotification(`Staff account created: ${next.fullName}`, "system");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen grid place-items-center bg-background px-4">
        <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <img src={roboLogoDataUrl} alt="Robo Al Ain" className="h-10 w-10" />
            <h1 className="text-2xl font-bold">Admin Sign In</h1>
          </div>
          <Input placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <Button className="w-full" onClick={login}>Sign In</Button>
          <p className="text-xs text-muted-foreground">Default: admin / robo2026admin</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-72 border-r border-border p-4 space-y-4 bg-card">
        <div className="flex items-center gap-2">
          <img src={roboLogoDataUrl} alt="Robo Al Ain" className="h-9 w-9" />
          <div>
            <p className="font-semibold">Robo Admin</p>
            <p className="text-xs text-muted-foreground">Control Center</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menu.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${location.pathname === item.path ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="rounded-lg border border-border p-3 text-xs">
          <p>Store pages:</p>
          <div className="mt-2 space-y-1">
            <Link className="text-primary underline block" to="/" target="_blank">Open storefront</Link>
            <Link className="text-primary underline block" to="/account" target="_blank">Open account page</Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => copyText(window.location.origin)}>
              <Copy className="h-4 w-4 mr-1" /> Copy URL
            </Button>
            <Button variant="outline" onClick={markAllRead}>
              <Bell className="h-4 w-4 mr-1" /> Notifications ({unreadCount})
            </Button>
            <Button variant="destructive" onClick={() => setIsAuthenticated(false)}>Sign out</Button>
          </div>
        </header>

        {section === "/" && (
          <section className="grid gap-4 lg:grid-cols-4">
            <article className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Orders</p><p className="text-2xl font-bold">{orders.length}</p></article>
            <article className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold">AED {revenue.toFixed(2)}</p></article>
            <article className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Products</p><p className="text-2xl font-bold">{products.length}</p></article>
            <article className="rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground">Accounts</p><p className="text-2xl font-bold">{accounts.length}</p></article>
            <div className="rounded-xl border border-border p-4 lg:col-span-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {section === "/prices" && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h2 className="text-xl font-semibold">Add Product</h2>
              <div className="grid gap-2 md:grid-cols-3">
                <Input placeholder="Name" value={newProduct.name} onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))} />
                <Input placeholder="Price" type="number" value={newProduct.price} onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))} />
                <Input placeholder="Category" value={newProduct.category} onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))} />
                <Input placeholder="Unit" value={newProduct.unit} onChange={(event) => setNewProduct((prev) => ({ ...prev, unit: event.target.value }))} />
                <Input placeholder="Image URL" value={newProduct.image} onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))} />
                <Input placeholder="Original Price" type="number" value={newProduct.originalPrice} onChange={(event) => setNewProduct((prev) => ({ ...prev, originalPrice: event.target.value }))} />
              </div>
              <Button onClick={addProduct}>Add Product</Button>
            </div>

            <div className="rounded-xl border border-border p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground"><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-border/50">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">AED {product.price.toFixed(2)}</td>
                      <td className="py-2">
                        <Button size="sm" variant={product.inStock ? "outline" : "default"} onClick={() => onProductsChange(products.map((item) => item.id === product.id ? { ...item, inStock: !item.inStock } : item))}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {section === "/offers" && (
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Offers</h2>
            <div className="grid gap-2 md:grid-cols-4">
              <Input placeholder="Product ID" value={newOffer.productId} onChange={(event) => setNewOffer((prev) => ({ ...prev, productId: event.target.value }))} />
              <Input placeholder="Title" value={newOffer.title} onChange={(event) => setNewOffer((prev) => ({ ...prev, title: event.target.value }))} />
              <Input placeholder="Description" value={newOffer.description} onChange={(event) => setNewOffer((prev) => ({ ...prev, description: event.target.value }))} />
              <Input placeholder="Discount %" type="number" value={newOffer.discountPercent} onChange={(event) => setNewOffer((prev) => ({ ...prev, discountPercent: event.target.value }))} />
            </div>
            <Button onClick={createOffer}>Create Offer</Button>
            {offers.map((offer) => (
              <div key={offer.id} className="rounded-lg border border-border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-sm text-muted-foreground">Product #{offer.productId} • {offer.discountPercent}%</p>
                </div>
                <Button variant={offer.active ? "outline" : "default"} onClick={() => onOffersChange(offers.map((item) => item.id === offer.id ? { ...item, active: !item.active } : item))}>
                  {offer.active ? "Disable" : "Enable"}
                </Button>
              </div>
            ))}
          </section>
        )}


        {section === "/promos" && (
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Promo Codes</h2>
            <div className="grid gap-2 md:grid-cols-3">
              <Input placeholder="Code (e.g. RAMADAN20)" value={newPromo.code} onChange={(event) => setNewPromo((prev) => ({ ...prev, code: event.target.value }))} />
              <Input placeholder="Discount %" type="number" value={newPromo.discountPercent} onChange={(event) => setNewPromo((prev) => ({ ...prev, discountPercent: event.target.value }))} />
              <Button onClick={createPromo}>Create promo</Button>
            </div>
            <div className="space-y-2">
              {settings.promoCodes.length ? settings.promoCodes.map((promo) => (
                <div key={promo.id} className="rounded-lg border border-border p-3 flex items-center justify-between gap-2 text-sm">
                  <div>
                    <p className="font-medium">{promo.code}</p>
                    <p className="text-muted-foreground">{promo.discountPercent}% off</p>
                  </div>
                  <Button variant={promo.active ? "outline" : "default"} onClick={() => onSettingsChange({ ...settings, promoCodes: settings.promoCodes.map((item) => item.id === promo.id ? { ...item, active: !item.active } : item) })}>
                    {promo.active ? "Disable" : "Enable"}
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground">No promo codes yet.</p>}
            </div>
          </section>
        )}

        {section === "/deals" && (
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Deals Editor</h2>
            <Input placeholder="Deals headline" value={settings.deals.headline} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, headline: event.target.value } })} />
            <Input placeholder="Deals subtitle" value={settings.deals.subtitle} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, subtitle: event.target.value } })} />
            <Input type="datetime-local" value={settings.deals.endAtIso ? new Date(settings.deals.endAtIso).toISOString().slice(0, 16) : ""} onChange={(event) => onSettingsChange({ ...settings, deals: { ...settings.deals, endAtIso: event.target.value ? new Date(event.target.value).toISOString() : "" } })} />
          </section>
        )}

        {section === "/requests" && (
          <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-2">
              {orders.map((order) => (
                <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="w-full rounded-lg border border-border p-3 text-left">
                  <div className="flex justify-between"><p>{order.customer}</p><p className="text-sm text-muted-foreground">{order.date}</p></div>
                  <p className="text-sm">{order.fulfillment} • {order.address}</p>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-border p-4 text-sm">
              {selectedOrder ? (
                <div className="space-y-1">
                  <p><strong>Name:</strong> {selectedOrder.customer}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                  <p><strong>Total:</strong> AED {selectedOrder.total.toFixed(2)}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Pick an order.</p>
              )}
            </div>
          </section>
        )}

        {section === "/integrations" && (
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xl font-semibold">API Settings</h2>
            <Input placeholder="Email API key" value={settings.integrations.emailApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, emailApiKey: event.target.value } })} />
            <Input placeholder="SMS API key" value={settings.integrations.smsApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, smsApiKey: event.target.value } })} />
            <Input placeholder="WhatsApp API key" value={settings.integrations.whatsappApiKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, whatsappApiKey: event.target.value } })} />
            <Input placeholder="Payment gateway key" value={settings.integrations.paymentGatewayKey} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, paymentGatewayKey: event.target.value } })} />
            <Input placeholder="Webhook URL" value={settings.integrations.webhookUrl} onChange={(event) => onSettingsChange({ ...settings, integrations: { ...settings.integrations, webhookUrl: event.target.value } })} />
          </section>
        )}

        {section === "/cards" && (
          <section className="rounded-xl border border-border p-4 space-y-2">
            <h2 className="text-xl font-semibold">Saved Cards</h2>
            {savedCards.length ? savedCards.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-3 text-sm">
                {order.cardHolder || order.customer} • **** {order.cardLast4}
              </div>
            )) : <p className="text-sm text-muted-foreground">No cards yet.</p>}
          </section>
        )}

        {section === "/notifications" && (
          <section className="rounded-xl border border-border p-4 space-y-2">
            {notifications.map((item) => (
              <div key={item.id} className={`rounded-lg border p-3 ${item.read ? "border-border" : "border-primary"}`}>
                <p>{item.message}</p>
                <p className="text-xs text-muted-foreground">{item.createdAt}</p>
              </div>
            ))}
          </section>
        )}

        {section === "/accounts" && (
          <section className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-xl font-semibold">Customer Accounts</h2>
            {accounts.filter((account) => account.role === "customer").map((account) => (
              <div key={account.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex justify-between"><p className="font-medium">{account.fullName}</p><p>{account.verified ? "Verified" : "Pending"}</p></div>
                <p className="text-muted-foreground">{account.email || account.phone}</p>
                <p className="text-xs mt-1">Payments: {account.paymentHistory.length} • Saved cards: {account.savedCards.length}</p>
              </div>
            ))}
          </section>
        )}

        {section === "/team" && (
          <section className="space-y-4">
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h2 className="text-xl font-semibold">Create team user with permissions</h2>
              <div className="grid gap-2 md:grid-cols-3">
                <Input placeholder="Full name" value={newStaff.fullName} onChange={(event) => setNewStaff((prev) => ({ ...prev, fullName: event.target.value }))} />
                <Input placeholder="Email" value={newStaff.email} onChange={(event) => setNewStaff((prev) => ({ ...prev, email: event.target.value }))} />
                <Input placeholder="Phone" value={newStaff.phone} onChange={(event) => setNewStaff((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Button variant={newStaff.canViewOrders ? "default" : "outline"} onClick={() => setNewStaff((prev) => ({ ...prev, canViewOrders: !prev.canViewOrders }))}>Can view orders</Button>
                <Button variant={newStaff.canViewProfits ? "default" : "outline"} onClick={() => setNewStaff((prev) => ({ ...prev, canViewProfits: !prev.canViewProfits }))}>Can view profits</Button>
                <Button variant={newStaff.canViewCards ? "default" : "outline"} onClick={() => setNewStaff((prev) => ({ ...prev, canViewCards: !prev.canViewCards }))}>Can view cards</Button>
              </div>
              <Button onClick={createStaff}>Create team user</Button>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-2">
              <h3 className="font-semibold">Team members</h3>
              <p className="text-xs text-muted-foreground">Owner permissions stay full: {JSON.stringify(fullAdminPermissions)}</p>
              {accounts.filter((account) => account.role === "admin").length ? (
                accounts.filter((account) => account.role === "admin").map((account) => (
                  <div key={account.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{account.fullName}</p>
                    <p>{account.email || account.phone}</p>
                    <p className="text-xs text-muted-foreground">Orders: {account.permissions.canViewOrders ? "Yes" : "No"} • Profits: {account.permissions.canViewProfits ? "Yes" : "No"} • Cards: {account.permissions.canViewCards ? "Yes" : "No"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No team users yet.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;
