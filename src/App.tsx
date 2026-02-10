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

const queryClient = new QueryClient();
const SYNC_INTERVAL_MS = 3000;

const App = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const hasHydratedProducts = useRef(false);
  const hasHydratedOrders = useRef(false);

  useEffect(() => {
    let active = true;
    const refreshProducts = async () => {
      const nextProducts = await loadProducts(initialProducts);
      if (active) {
        setProducts(nextProducts);
        hasHydratedProducts.current = true;
      }
    };
    const refreshOrders = async () => {
      const nextOrders = await loadOrders();
      if (active) {
        setOrders(nextOrders);
        hasHydratedOrders.current = true;
      }
    };
    const refreshAll = () => {
      void refreshProducts();
      void refreshOrders();
    };

    refreshAll();

    if (!hasRemoteOrdersApi() && !hasRemoteProductsApi()) {
      return () => {
        active = false;
      };
    }

    const interval = window.setInterval(refreshAll, SYNC_INTERVAL_MS);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        refreshAll();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedOrders.current) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveOrders(orders);
    }, 500);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [orders]);

  useEffect(() => {
    if (!hasHydratedProducts.current) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveProducts(products);
    }, 500);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [products]);

  const handleSaveProducts = () => {
    void saveProducts(products);
  };

  const handleCreateOrder = (order: Order) => {
    setOrders((prev) => mergeOrders([order, ...prev]));
    void pushOrder(order).then((nextOrders) => {
      setOrders(nextOrders);
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Index products={products} onCreateOrder={handleCreateOrder} />}
            />
            <Route
              path="/admin"
              element={
                <Admin
                  products={products}
                  orders={orders}
                  onProductsChange={setProducts}
                  onOrdersChange={setOrders}
                  onSaveProducts={handleSaveProducts}
                  productsSyncEnabled={hasRemoteProductsApi()}
                  ordersSyncEnabled={hasRemoteOrdersApi()}
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
