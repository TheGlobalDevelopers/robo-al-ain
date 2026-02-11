import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import { products as initialProducts } from "@/data/products";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { hasRemoteOrdersApi, loadOrders, mergeOrders, pushOrder, saveOrders } from "@/lib/orderStore";
import { hasRemoteProductsApi, loadProducts, saveProducts } from "@/lib/productStore";
import { hasRemoteOffersApi, loadOffers, saveOffers } from "@/lib/offerStore";
import { Offer } from "@/types/offer";
import CartPage from "./pages/CartPage";
import PaymentInfoPage from "./pages/PaymentInfoPage";
import ProductsPage from "./pages/ProductsPage";
import AccountPage from "./pages/AccountPage";
import { defaultSettings, SiteSettings } from "@/types/settings";
import { hasRemoteSettingsApi, loadSettings, saveSettings } from "@/lib/settingsStore";
import { AdminNotification } from "@/types/notification";
import { hasRemoteNotificationsApi, loadNotifications, saveNotifications, mergeNotifications } from "@/lib/notificationStore";
import { Subscriber } from "@/types/subscriber";
import { loadSubscribers, saveSubscribers } from "@/lib/subscriberStore";
import { UserAccount } from "@/types/account";
import { loadAccounts, saveAccounts } from "@/lib/accountStore";

const queryClient = new QueryClient();

const App = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const hasHydratedProducts = useRef(false);
  const isApplyingRemote = useRef(false);

  useEffect(() => {
    let active = true;

    const refreshAll = async () => {
      const [nextProducts, nextOrders, nextOffers, nextSettings, nextNotifications, nextSubscribers, nextAccounts] = await Promise.all([
        loadProducts(initialProducts),
        loadOrders(),
        loadOffers(),
        loadSettings(),
        loadNotifications(),
        loadSubscribers(),
        loadAccounts(),
      ]);
      if (!active) return;
      isApplyingRemote.current = true;
      setProducts(nextProducts);
      hasHydratedProducts.current = true;
      setOrders(nextOrders);
      setOffers(nextOffers);
      setSettings(nextSettings);
      setNotifications(nextNotifications);
      setSubscribers(nextSubscribers);
      setAccounts(nextAccounts);
      window.setTimeout(() => {
        isApplyingRemote.current = false;
      }, 0);
    };

    void refreshAll();
    const shouldPoll = hasRemoteOrdersApi() || hasRemoteProductsApi() || hasRemoteOffersApi() || hasRemoteSettingsApi() || hasRemoteNotificationsApi();
    if (!shouldPoll) {
      return () => {
        active = false;
      };
    }
    const interval = window.setInterval(() => void refreshAll(), 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    void saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (!hasHydratedProducts.current) return;
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveProducts(products), 500);
    return () => window.clearTimeout(timeout);
  }, [products]);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveOffers(offers), 500);
    return () => window.clearTimeout(timeout);
  }, [offers]);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveSettings(settings), 500);
    return () => window.clearTimeout(timeout);
  }, [settings]);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveNotifications(notifications), 500);
    return () => window.clearTimeout(timeout);
  }, [notifications]);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveSubscribers(subscribers), 500);
    return () => window.clearTimeout(timeout);
  }, [subscribers]);

  useEffect(() => {
    if (isApplyingRemote.current) return;
    const timeout = window.setTimeout(() => void saveAccounts(accounts), 500);
    return () => window.clearTimeout(timeout);
  }, [accounts]);

  useEffect(() => {
    if (typeof window === "undefined" || !products.length || !orders.length) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = "storefront-auto-offer-date";
    if (localStorage.getItem(dailyKey) === today) {
      return;
    }

    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const recentOrders = orders.filter((order) => order.id >= threeDaysAgo);
    if (!recentOrders.length) {
      return;
    }

    const counts = new Map<number, number>();
    recentOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.name === item.name);
        if (!product) return;
        counts.set(product.id, (counts.get(product.id) ?? 0) + item.quantity);
      });
    });

    const leastPurchased = Array.from(counts.entries()).sort((a, b) => a[1] - b[1])[0];
    if (!leastPurchased) {
      return;
    }

    const targetProduct = products.find((product) => product.id === leastPurchased[0]);
    if (!targetProduct) {
      return;
    }

    setOffers((prev) => {
      const existing = prev.find((offer) => offer.id === -1);
      const autoOffer = {
        id: -1,
        productId: targetProduct.id,
        title: `Auto Deal: ${targetProduct.name}`,
        description: "Least purchased in last 3 days",
        discountPercent: 12,
        active: true,
        createdAt: new Date().toLocaleString(),
      };
      if (existing) {
        return prev.map((offer) => (offer.id === -1 ? autoOffer : offer));
      }
      return [autoOffer, ...prev];
    });
    localStorage.setItem(dailyKey, today);
  }, [orders, products]);

  useEffect(() => {
    if (!subscribers.length || !offers.length || !settings.integrations.emailApiKey.trim()) {
      return;
    }
    const now = Date.now();
    const every3Days = 3 * 24 * 60 * 60 * 1000;
    const due = subscribers.some((subscriber) => !subscriber.lastSentAt || now - new Date(subscriber.lastSentAt).getTime() >= every3Days);
    if (!due) return;

    setNotifications((prev) =>
      mergeNotifications([
        {
          id: Date.now(),
          message: `Newsletter campaign queued for ${subscribers.length} subscribers via Email API.`,
          type: "system",
          createdAt: new Date().toLocaleString(),
          read: false,
        },
        ...prev,
      ])
    );

    const stamp = new Date().toISOString();
    setSubscribers((prev) => prev.map((subscriber) => ({ ...subscriber, lastSentAt: stamp })));
  }, [subscribers, offers, settings.integrations.emailApiKey]);

  const handleCreateOrder = (order: Order) => {
    setOrders((prev) => mergeOrders([order, ...prev]));
    setAccounts((prev) =>
      prev.map((account) => {
        const phoneMatches = account.phone.replace(/\D/g, "") && account.phone.replace(/\D/g, "") === order.phone.replace(/\D/g, "");
        if (!phoneMatches) return account;

        const paymentHistory = [
          ...account.paymentHistory.filter((item) => item.orderId !== order.id),
          {
            orderId: order.id,
            total: order.total,
            date: order.date,
            method: order.paymentMethod,
            status: order.paymentMethod === "online" ? "paid" : "pending",
          },
        ];

        const shouldSaveCard = Boolean(order.cardLast4 && order.cardHolder);
        const hasCard = shouldSaveCard && account.savedCards.some((card) => card.last4 === order.cardLast4);
        return {
          ...account,
          paymentHistory,
          savedCards:
            shouldSaveCard && !hasCard
              ? [
                  ...account.savedCards,
                  {
                    id: Date.now(),
                    holder: order.cardHolder || account.fullName,
                    last4: order.cardLast4 || "",
                    brand: "Card",
                    addedAt: new Date().toLocaleString(),
                  },
                ]
              : account.savedCards,
        };
      })
    );

    const messages: AdminNotification[] = [
      { id: Date.now(), message: `New ${order.fulfillment} order from ${order.customer}`, type: "order", createdAt: new Date().toLocaleString(), read: false },
    ];
    if (settings.integrations.smsApiKey.trim()) {
      messages.push({ id: Date.now() + 1, message: `SMS confirmation queued for ${order.phone}`, type: "system", createdAt: new Date().toLocaleString(), read: false });
    }
    if (settings.integrations.whatsappApiKey.trim()) {
      messages.push({ id: Date.now() + 2, message: `WhatsApp confirmation queued for ${order.phone}`, type: "system", createdAt: new Date().toLocaleString(), read: false });
    }
    setNotifications((prev) => mergeNotifications([...messages, ...prev]));
    void pushOrder(order).then((nextOrders) => setOrders(nextOrders));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index products={products} offers={offers} onCreateOrder={handleCreateOrder} settings={settings} />} />
            <Route path="/products/:category" element={<ProductsPage products={products} onCreateOrder={handleCreateOrder} />} />
            <Route path="/products" element={<ProductsPage products={products} onCreateOrder={handleCreateOrder} />} />
            <Route path="/cart" element={<CartPage onCreateOrder={handleCreateOrder} />} />
            <Route
              path="/admin/*"
              element={
                <Admin
                  products={products}
                  orders={orders}
                  offers={offers}
                  settings={settings}
                  notifications={notifications}
                  onProductsChange={setProducts}
                  onOffersChange={setOffers}
                  onSettingsChange={setSettings}
                  onNotificationsChange={setNotifications}
                  accounts={accounts}
                  onAccountsChange={setAccounts}
                />
              }
            />
            <Route path="/payments/:type" element={<PaymentInfoPage />} />
            <Route path="/account" element={<AccountPage accounts={accounts} onAccountsChange={setAccounts} orders={orders} settings={settings} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
