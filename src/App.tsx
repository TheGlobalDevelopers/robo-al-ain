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
import { defaultSettings, SiteSettings } from "@/types/settings";
import { hasRemoteSettingsApi, loadSettings, saveSettings } from "@/lib/settingsStore";
import { AdminNotification } from "@/types/notification";
import { hasRemoteNotificationsApi, loadNotifications, saveNotifications, mergeNotifications } from "@/lib/notificationStore";

const queryClient = new QueryClient();

const App = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const hasHydratedProducts = useRef(false);

  useEffect(() => {
    let active = true;

    const refreshAll = async () => {
      const [nextProducts, nextOrders, nextOffers, nextSettings, nextNotifications] = await Promise.all([
        loadProducts(initialProducts),
        loadOrders(),
        loadOffers(),
        loadSettings(),
        loadNotifications(),
      ]);
      if (!active) return;
      setProducts(nextProducts);
      hasHydratedProducts.current = true;
      setOrders(nextOrders);
      setOffers(nextOffers);
      setSettings(nextSettings);
      setNotifications(nextNotifications);
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
    void saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (!hasHydratedProducts.current) return;
    const timeout = window.setTimeout(() => void saveProducts(products), 500);
    return () => window.clearTimeout(timeout);
  }, [products]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void saveOffers(offers), 500);
    return () => window.clearTimeout(timeout);
  }, [offers]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void saveSettings(settings), 500);
    return () => window.clearTimeout(timeout);
  }, [settings]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void saveNotifications(notifications), 500);
    return () => window.clearTimeout(timeout);
  }, [notifications]);

  const handleCreateOrder = (order: Order) => {
    setOrders((prev) => mergeOrders([order, ...prev]));
    setNotifications((prev) => mergeNotifications([{ id: Date.now(), message: `New ${order.fulfillment} order from ${order.customer}`, type: "order", createdAt: new Date().toLocaleString(), read: false }, ...prev]));
    void pushOrder(order).then((nextOrders) => setOrders(nextOrders));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index products={products} offers={offers} onCreateOrder={handleCreateOrder} />} />
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
                />
              }
            />
            <Route path="/payments/:type" element={<PaymentInfoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
