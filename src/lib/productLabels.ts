import { Product } from "@/types/product";
import { Language, translations } from "@/lib/i18n";

export const getProductName = (language: Language, product: Product) => {
  if (language === "ar") {
    return translations.ar.productData.names[product.id] ?? product.name;
  }
  return product.name;
};

export const getProductUnit = (language: Language, product: Product) => {
  if (language === "ar") {
    return translations.ar.productData.units[product.id] ?? product.unit;
  }
  return product.unit;
};

export const getProductCategory = (language: Language, product: Product) => {
  if (language === "ar") {
    return (
      translations.ar.productData.categories[product.category as keyof typeof translations.ar.productData.categories] ??
      product.category
    );
  }
  return product.category;
};
