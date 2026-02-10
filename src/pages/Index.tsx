import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import DealsSection from "@/components/DealsSection";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { CartItem, Product } from "@/types/product";
import { toast } from "sonner";
import { Language, translations } from "@/lib/i18n";
import { getProductName } from "@/lib/productLabels";
import { Order } from "@/types/order";
import { scrollToId } from "@/lib/scroll";
interface IndexProps {
  products: Product[];
  onCreateOrder: (order: Order) => void;
}

const Index = ({ products, onCreateOrder }: IndexProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.trim()) {
      scrollToId("products");
    }
  }, [searchQuery]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(
      language === "ar"
        ? `تمت إضافة ${getProductName(language, product)} إلى السلة!`
        : `${getProductName(language, product)} added to cart!`
    );
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(language === "ar" ? "تمت إزالة المنتج من السلة" : "Item removed from cart");
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const t = translations[language];

  const handleCheckout = (payload: {
    customer: string;
    phone: string;
    address: string;
    paymentMethod: "online" | "cod";
    fulfillment: "delivery" | "pickup";
  }) => {
    if (!cartItems.length) {
      return;
    }
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = payload.fulfillment === "delivery" && subtotal < 100 ? 15 : 0;
    const total = subtotal + deliveryFee;
    const order: Order = {
      id: Date.now(),
      customer: payload.customer,
      phone: payload.phone,
      address: payload.address,
      paymentMethod: payload.paymentMethod,
      fulfillment: payload.fulfillment,
      items: cartItems.map((item) => ({
        name: getProductName(language, item),
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      date: new Date().toLocaleString(),
      source: "online",
    };
    onCreateOrder(order);
    setCartItems([]);
    setIsCartOpen(false);
    toast.success(t.cart.orderPlaced);
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onToggleLanguage={() =>
          setLanguage((prev) => (prev === "en" ? "ar" : "en"))
        }
        onCategorySelect={(category) => setActiveCategory(category)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Hero language={language} />
      <Categories
        language={language}
        onCategorySelect={(category) => setActiveCategory(category)}
      />
      <DealsSection products={products} onAddToCart={handleAddToCart} language={language} />
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        language={language}
        activeTab={activeCategory}
        onTabChange={(category) => setActiveCategory(category)}
        searchQuery={searchQuery}
      />
      <Footer
        language={language}
        onCategorySelect={(category) => setActiveCategory(category)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        language={language}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;
