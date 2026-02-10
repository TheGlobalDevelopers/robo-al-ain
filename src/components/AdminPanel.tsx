import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/product";
import { Language } from "@/lib/i18n";
import { Order } from "@/types/order";
import { toast } from "sonner";

interface AdminPanelProps {
  language: Language;
  products: Product[];
  orders: Order[];
  onProductsChange: (products: Product[]) => void;
  onOrdersChange: (orders: Order[]) => void;
  onSaveProducts: () => void;
  onSignOut: () => void;
  productsSyncEnabled: boolean;
  ordersSyncEnabled: boolean;
}

const AdminPanel = ({
  language,
  products,
  orders,
  onProductsChange,
  onOrdersChange,
  onSaveProducts,
  onSignOut,
  productsSyncEnabled,
  ordersSyncEnabled,
}: AdminPanelProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [orderItems, setOrderItems] = useState("");
  const [orderTotal, setOrderTotal] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    unit: "",
    originalPrice: "",
  });

  const labels = useMemo(
    () => ({
      title: language === "ar" ? "لوحة الإدارة" : "Admin Panel",
      manageProducts: language === "ar" ? "إدارة المنتجات" : "Manage Products",
      addProduct: language === "ar" ? "إضافة منتج" : "Add Product",
      name: language === "ar" ? "الاسم" : "Name",
      price: language === "ar" ? "السعر" : "Price",
      category: language === "ar" ? "الفئة" : "Category",
      image: language === "ar" ? "الصورة" : "Image",
      unit: language === "ar" ? "الوحدة" : "Unit",
      originalPrice: language === "ar" ? "السعر قبل الخصم" : "Original Price",
      stock: language === "ar" ? "المخزون" : "Stock",
      inStock: language === "ar" ? "متوفر" : "In Stock",
      outOfStock: language === "ar" ? "غير متوفر" : "Out of Stock",
      markOutOfStock: language === "ar" ? "نفاد المخزون" : "Mark Out of Stock",
      markInStock: language === "ar" ? "إرجاع للمخزون" : "Mark In Stock",
      orders: language === "ar" ? "المشتريات" : "Purchases",
      customer: language === "ar" ? "العميل" : "Customer",
      recordOrder: language === "ar" ? "تسجيل طلب من السلة" : "Record Order From Cart",
      noOrders: language === "ar" ? "لا توجد طلبات بعد." : "No purchases recorded yet.",
      emptyCart: language === "ar" ? "أضف تفاصيل الطلب يدويًا." : "Add purchase details manually.",
      items: language === "ar" ? "المنتجات" : "Items",
      total: language === "ar" ? "الإجمالي" : "Total",
      addPurchase: language === "ar" ? "تسجيل عملية شراء" : "Record Purchase",
      saveChanges: language === "ar" ? "حفظ التعديلات" : "Save Changes",
      saved: language === "ar" ? "تم حفظ التغييرات." : "Changes saved.",
      lastSaved: language === "ar" ? "آخر حفظ" : "Last saved",
      phone: language === "ar" ? "رقم الهاتف" : "Phone",
      address: language === "ar" ? "العنوان" : "Address",
      payment: language === "ar" ? "طريقة الدفع" : "Payment",
      paymentOnline: language === "ar" ? "دفع إلكتروني" : "Online",
      paymentCod: language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery",
      fulfillment: language === "ar" ? "طريقة الاستلام" : "Fulfillment",
      fulfillmentDelivery: language === "ar" ? "توصيل" : "Delivery",
      fulfillmentPickup: language === "ar" ? "استلام" : "Pickup",
      signOut: language === "ar" ? "تسجيل الخروج" : "Sign Out",
      liveNote:
        language === "ar"
          ? "التغييرات تتزامن تلقائيًا بين الأجهزة. يمكنك أيضًا استخدام زر الحفظ."
          : "Changes sync automatically across devices. You can also use Save.",
      syncWarning:
        language === "ar"
          ? "المزامنة بين الأجهزة متوقفة. تأكد من إعداد Vercel KV ومتغيرات البيئة."
          : "Cross-device sync is offline. Configure Vercel KV and environment variables.",
    }),
    [language]
  );

  const handleProductChange = (id: number, field: keyof Product, value: string | number | boolean | null) => {
    onProductsChange(
      products.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: value,
            }
          : product
      )
    );
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.image || !newProduct.unit) {
      return;
    }
    const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
    const priceValue = Number(newProduct.price);
    const originalPriceValue = newProduct.originalPrice ? Number(newProduct.originalPrice) : null;
    onProductsChange([
      ...products,
      {
        id: nextId,
        name: newProduct.name,
        price: Number.isNaN(priceValue) ? 0 : priceValue,
        originalPrice: Number.isNaN(originalPriceValue) ? null : originalPriceValue,
        rating: 4.5,
        image: newProduct.image,
        category: newProduct.category,
        unit: newProduct.unit,
        inStock: true,
      },
    ]);
    setNewProduct({ name: "", price: "", category: "", image: "", unit: "", originalPrice: "" });
  };

  const handleRecordOrder = () => {
    if (!orderItems.trim() || !orderTotal) {
      return;
    }
    const nextId = Math.max(0, ...orders.map((order) => order.id)) + 1;
    onOrdersChange([
      {
        id: nextId,
        customer: customerName || (language === "ar" ? "عميل" : "Customer"),
        phone: customerPhone,
        address: customerAddress,
        paymentMethod,
        fulfillment,
        items: orderItems.split(",").map((item) => ({
          name: item.trim(),
          quantity: 1,
          price: 0,
        })),
        total: Number(orderTotal),
        date: new Date().toLocaleString(),
        source: "manual",
      },
      ...orders,
    ]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPaymentMethod("cod");
    setFulfillment("delivery");
    setOrderItems("");
    setOrderTotal("");
  };

  return (
    <section id="admin" className="py-12 bg-secondary/40">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{labels.title}</h2>
            <p className="text-muted-foreground">{labels.manageProducts}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="rounded-full" onClick={onSignOut}>
              {labels.signOut}
            </Button>
            {lastSavedAt ? (
              <div className="text-xs text-muted-foreground">
                {labels.lastSaved}: {lastSavedAt}
              </div>
            ) : null}
            <Button
              onClick={() => {
                onSaveProducts();
                const timestamp = new Date().toLocaleTimeString();
                setLastSavedAt(timestamp);
                toast.success(labels.saved);
              }}
              className="rounded-full"
            >
              {labels.saveChanges}
            </Button>
          </div>
        </div>
        {!productsSyncEnabled || !ordersSyncEnabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {labels.syncWarning}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{labels.addProduct}</h3>
                <span className="text-xs text-muted-foreground">{labels.liveNote}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Input
                  placeholder={labels.name}
                  value={newProduct.name}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  placeholder={labels.price}
                  type="number"
                  value={newProduct.price}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))}
                />
                <Input
                  placeholder={labels.category}
                  value={newProduct.category}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}
                />
                <Input
                  placeholder={labels.unit}
                  value={newProduct.unit}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, unit: event.target.value }))}
                />
                <Input
                  placeholder={labels.image}
                  value={newProduct.image}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, image: event.target.value }))}
                />
                <Input
                  placeholder={labels.originalPrice}
                  type="number"
                  value={newProduct.originalPrice}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, originalPrice: event.target.value }))}
                />
              </div>
              <Button onClick={handleAddProduct} className="rounded-full">
                {labels.addProduct}
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-card p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3">{labels.name}</th>
                    <th className="pb-3">{labels.price}</th>
                    <th className="pb-3">{labels.category}</th>
                    <th className="pb-3">{labels.unit}</th>
                    <th className="pb-3">{labels.image}</th>
                    <th className="pb-3">{labels.originalPrice}</th>
                    <th className="pb-3">{labels.stock}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-border/60">
                      <td className="py-3">
                        <Input
                          value={product.name}
                          onChange={(event) => handleProductChange(product.id, "name", event.target.value)}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(event) => handleProductChange(product.id, "price", Number(event.target.value))}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          value={product.category}
                          onChange={(event) => handleProductChange(product.id, "category", event.target.value)}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          value={product.unit}
                          onChange={(event) => handleProductChange(product.id, "unit", event.target.value)}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          value={product.image}
                          onChange={(event) => handleProductChange(product.id, "image", event.target.value)}
                        />
                      </td>
                      <td className="py-3">
                        <Input
                          type="number"
                          value={product.originalPrice ?? ""}
                          onChange={(event) =>
                            handleProductChange(
                              product.id,
                              "originalPrice",
                              event.target.value ? Number(event.target.value) : null
                            )
                          }
                        />
                      </td>
                      <td className="py-3">
                        <Button
                          type="button"
                          variant={product.inStock ? "outline" : "default"}
                          className="rounded-full"
                          onClick={() => handleProductChange(product.id, "inStock", !product.inStock)}
                        >
                          {product.inStock ? labels.markOutOfStock : labels.markInStock}
                        </Button>
                        <div className="text-xs text-muted-foreground mt-1">
                          {product.inStock ? labels.inStock : labels.outOfStock}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{labels.orders}</h3>
                <p className="text-sm text-muted-foreground">{labels.emptyCart}</p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder={labels.customer}
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                <Input
                  placeholder={labels.phone}
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
                <Input
                  placeholder={labels.address}
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={fulfillment === "delivery" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setFulfillment("delivery")}
                  >
                    {labels.fulfillmentDelivery}
                  </Button>
                  <Button
                    type="button"
                    variant={fulfillment === "pickup" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setFulfillment("pickup")}
                  >
                    {labels.fulfillmentPickup}
                  </Button>
                </div>
                <Input
                  placeholder={labels.items}
                  value={orderItems}
                  onChange={(event) => setOrderItems(event.target.value)}
                />
                <Input
                  placeholder={labels.total}
                  type="number"
                  value={orderTotal}
                  onChange={(event) => setOrderTotal(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={paymentMethod === "online" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setPaymentMethod("online")}
                  >
                    {labels.paymentOnline}
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "cod" ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setPaymentMethod("cod")}
                  >
                    {labels.paymentCod}
                  </Button>
                </div>
                <Button
                  type="button"
                  className="w-full rounded-full"
                  onClick={handleRecordOrder}
                  disabled={!orderItems.trim() || !orderTotal}
                >
                  {labels.addPurchase}
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-card p-6 space-y-4">
              {orders.length ? (
                <ul className="space-y-4">
                  {orders.map((order) => (
                    <li key={order.id} className="border border-border/60 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.date}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {order.source === "online"
                          ? language === "ar"
                            ? "طلب عبر المتجر"
                            : "Online order"
                          : language === "ar"
                            ? "إدخال يدوي"
                            : "Manual entry"}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {labels.fulfillment}: {order.fulfillment === "pickup" ? labels.fulfillmentPickup : labels.fulfillmentDelivery}
                      </div>
                      {order.fulfillment === "delivery" && (
                        <>
                          <div className="text-xs text-muted-foreground">
                            {labels.phone}: {order.phone || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {labels.address}: {order.address || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {labels.payment}: {order.paymentMethod === "online" ? labels.paymentOnline : labels.paymentCod}
                          </div>
                        </>
                      )}
                      <ul className="mt-3 text-sm text-muted-foreground space-y-1">
                        {order.items.map((item) => (
                          <li key={`${order.id}-${item.name}`}>
                            {item.name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 font-semibold text-primary">
                        AED {order.total.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{labels.noOrders}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
