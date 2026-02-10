export interface Product {
  id: number;
  name: string;
  nameAr?: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  image: string;
  category: string;
  unit: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}
