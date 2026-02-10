import { Product } from "@/types/product";

export const products: Product[] = [
  // Fresh
  { id: 1, name: "Organic Red Apples", price: 12.99, originalPrice: 15.99, rating: 4.8, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 2, name: "Fresh Bananas", price: 6.49, originalPrice: null, rating: 4.6, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 3, name: "Sweet Oranges", price: 8.99, originalPrice: 11.99, rating: 4.7, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 4, name: "Fresh Strawberries", price: 18.99, originalPrice: null, rating: 4.9, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },
  { id: 5, name: "Ripe Mangoes", price: 24.99, originalPrice: 29.99, rating: 4.8, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 6, name: "Fresh Grapes", price: 15.99, originalPrice: null, rating: 4.5, image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },

  { id: 7, name: "Fresh Tomatoes", price: 5.49, originalPrice: 7.99, rating: 4.6, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 8, name: "Organic Cucumbers", price: 4.99, originalPrice: null, rating: 4.5, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },
  { id: 9, name: "Fresh Lettuce", price: 3.99, originalPrice: null, rating: 4.7, image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop", category: "Fresh", unit: "1 head", inStock: true },
  { id: 10, name: "Bell Peppers Mix", price: 9.99, originalPrice: 12.99, rating: 4.6, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },
  { id: 11, name: "Fresh Carrots", price: 4.49, originalPrice: null, rating: 4.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop", category: "Fresh", unit: "1 kg", inStock: true },
  { id: 12, name: "Organic Spinach", price: 6.99, originalPrice: null, rating: 4.8, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop", category: "Fresh", unit: "250g", inStock: true },

  // Dairy
  { id: 13, name: "Fresh Milk", price: 8.49, originalPrice: null, rating: 4.7, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", category: "Dairy", unit: "1 L", inStock: true },
  { id: 14, name: "Greek Yogurt", price: 12.99, originalPrice: 15.99, rating: 4.8, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop", category: "Dairy", unit: "500g", inStock: true },
  { id: 15, name: "Cheddar Cheese", price: 22.99, originalPrice: null, rating: 4.6, image: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop", category: "Dairy", unit: "250g", inStock: true },
  { id: 16, name: "Farm Fresh Eggs", price: 14.99, originalPrice: null, rating: 4.9, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop", category: "Dairy", unit: "12 pcs", inStock: true },

  // Meat
  { id: 17, name: "Fresh Chicken Breast", price: 35.99, originalPrice: 42.99, rating: 4.7, image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop", category: "Meat", unit: "1 kg", inStock: true },
  { id: 18, name: "Lamb Chops", price: 65.99, originalPrice: null, rating: 4.8, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop", category: "Meat", unit: "500g", inStock: true },
  { id: 19, name: "Fresh Salmon Fillet", price: 48.99, originalPrice: 55.99, rating: 4.9, image: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop", category: "Seafood", unit: "500g", inStock: true },
  { id: 20, name: "Ground Beef", price: 32.99, originalPrice: null, rating: 4.6, image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=400&fit=crop", category: "Meat", unit: "500g", inStock: true },

  // Bakery
  { id: 21, name: "Whole Grain Bread", price: 7.99, originalPrice: 9.99, rating: 4.7, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", category: "Bakery", unit: "1 loaf", inStock: true },
  { id: 22, name: "Fresh Croissants", price: 12.99, originalPrice: null, rating: 4.8, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop", category: "Bakery", unit: "4 pcs", inStock: true },
  { id: 23, name: "Arabic Pita Bread", price: 5.99, originalPrice: null, rating: 4.6, image: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&h=400&fit=crop", category: "Bakery", unit: "6 pcs", inStock: true },
  { id: 24, name: "Chocolate Muffins", price: 14.99, originalPrice: 18.99, rating: 4.5, image: "https://images.unsplash.com/photo-1558303155-14e2b4f6fa95?w=400&h=400&fit=crop", category: "Bakery", unit: "4 pcs", inStock: true },

  // Beverages
  { id: 25, name: "Fresh Orange Juice", price: 15.99, originalPrice: 19.99, rating: 4.8, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop", category: "Beverages", unit: "1 L", inStock: true },
  { id: 26, name: "Natural Mineral Water", price: 3.99, originalPrice: null, rating: 4.5, image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop", category: "Beverages", unit: "1.5 L", inStock: true },
  { id: 27, name: "Arabic Coffee Blend", price: 45.99, originalPrice: null, rating: 4.9, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop", category: "Beverages", unit: "250g", inStock: true },
  { id: 28, name: "Green Tea Premium", price: 18.99, originalPrice: 22.99, rating: 4.7, image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop", category: "Beverages", unit: "100 bags", inStock: true },

  // More products for variety
  { id: 29, name: "Avocados", price: 14.99, originalPrice: 18.99, rating: 4.8, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop", category: "Fresh", unit: "3 pcs", inStock: true },
  { id: 30, name: "Fresh Broccoli", price: 7.99, originalPrice: null, rating: 4.6, image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },
  { id: 31, name: "Butter Unsalted", price: 16.99, originalPrice: null, rating: 4.7, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop", category: "Dairy", unit: "200g", inStock: true },
  { id: 32, name: "Dates Premium Ajwa", price: 55.99, originalPrice: 65.99, rating: 4.9, image: "https://images.unsplash.com/photo-1580906855284-858931cbc506?w=400&h=400&fit=crop", category: "Fresh", unit: "500g", inStock: true },
  { id: 33, name: "Frozen Mixed Vegetables", price: 12.49, originalPrice: 15.49, rating: 4.6, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop", category: "Frozen", unit: "1 kg", inStock: true },
  { id: 34, name: "Potato Chips", price: 6.99, originalPrice: null, rating: 4.4, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=400&fit=crop", category: "Snacks", unit: "150g", inStock: true },
  { id: 37, name: "Paper Towels Value Pack", price: 18.99, originalPrice: 24.99, rating: 4.6, image: "https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&h=400&fit=crop", category: "Deals", unit: "6 rolls", inStock: true },
  { id: 38, name: "Dish Soap Bundle", price: 14.49, originalPrice: 19.49, rating: 4.5, image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop", category: "Deals", unit: "3 x 750ml", inStock: true },
  { id: 39, name: "Family Size Olive Oil", price: 42.99, originalPrice: 49.99, rating: 4.7, image: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc?w=400&h=400&fit=crop", category: "Deals", unit: "2 L", inStock: true },
  { id: 40, name: "Bulk Rice Offer", price: 39.99, originalPrice: 46.99, rating: 4.6, image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=400&fit=crop", category: "Deals", unit: "5 kg", inStock: true },
  { id: 41, name: "Breakfast Cereal Bundle", price: 27.99, originalPrice: 34.99, rating: 4.5, image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=400&fit=crop", category: "Deals", unit: "3 boxes", inStock: true },
  { id: 42, name: "Premium Pasta Pack", price: 16.99, originalPrice: 21.99, rating: 4.6, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=400&fit=crop", category: "Deals", unit: "4 packs", inStock: true },
  { id: 36, name: "Fresh Shrimp", price: 39.99, originalPrice: 45.99, rating: 4.7, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", category: "Seafood", unit: "500g", inStock: true },
];
