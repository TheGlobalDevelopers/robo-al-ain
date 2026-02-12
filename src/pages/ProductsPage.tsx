import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useMemo, useState } from "react";
import { CartItem, Product } from "@/types/product";
import { Language } from "@/lib/i18n";
import { useNavigate, useParams } from "react-router-dom";
import { Order } from "@/types/order";
import { toast } from "sonner";
import CartDrawer from "@/components/CartDrawer";
import { UserAccount } from "@/types/account";

interface ProductsPageProps {
  products: Product[];
  onCreateOrder: (order: Order) => void;
  currentAccount: UserAccount | null;
  cartItems: CartItem[];
  onCartItemsChange: (items: CartItem[]) => void;
}

const ProductsPage = ({ products, onCreateOrder, currentAccount, cartItems, onCartItemsChange }: ProductsPageProps) => {
  const [language, setLanguage] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const category = params.category || "all";

  const filtered = useMemo(() => {
    const categoryFiltered = category.toLowerCase() === "all"
      ? products
      : products.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryFiltered;
    return categoryFiltered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, category, searchQuery]);

  const handleAddToCart = (product: Product) => {
    const found = cartItems.find((item) => item.id === product.id);
    const nextItems = found
      ? cartItems.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cartItems, { ...product, quantity: 1 }];
    onCartItemsChange(nextItems);
    toast.success(`${product.name} added to cart`);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => prev === "en" ? "ar" : "en")}
        onCategorySelect={(next) => navigate(`/products/${next.toLowerCase()}`)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-32">
        <h1 className="text-3xl font-bold mb-2 capitalize">{category === "all" ? "All Products" : `${category} Products`}</h1>
        <p className="text-muted-foreground mb-6">Choose a category and browse the full list.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} language={language} />
          ))}
        </div>
      </main>

      <Footer language={language} onCategorySelect={(next) => navigate(`/products/${next.toLowerCase()}`)} products={products} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => onCartItemsChange(cartItems.map((item) => item.id === id ? { ...item, quantity } : item).filter((i) => i.quantity > 0))}
        onRemoveItem={(id) => onCartItemsChange(cartItems.filter((item) => item.id !== id))}
        language={language}
        onCheckout={({ customer, phone, address, paymentMethod, fulfillment }) => {
          if (!cartItems.length) return;
          const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          onCreateOrder({
            id: Date.now(),
            customer,
            phone,
            address,
            paymentMethod,
            fulfillment,
            items: cartItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
            total,
            date: new Date().toLocaleString(),
            source: "online",
            accountId: currentAccount?.id,
          });
          onCartItemsChange([]);
        }}
      />
    </div>
  );
};

export default ProductsPage;
