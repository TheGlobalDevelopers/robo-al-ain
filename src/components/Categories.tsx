import { Language, translations } from "@/lib/i18n";
import { scrollToId } from "@/lib/scroll";

const baseCategories = [
  { id: "Fresh", count: 265, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop" },
  { id: "Dairy", count: 85, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&h=120&fit=crop" },
  { id: "Bakery", count: 65, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop" },
  { id: "Seafood", count: 78, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=120&h=120&fit=crop" },
  { id: "Meat", count: 92, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=120&h=120&fit=crop" },
  { id: "Beverages", count: 110, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=120&h=120&fit=crop" },
  { id: "Frozen", count: 88, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=120&h=120&fit=crop" },
  { id: "Snacks", count: 134, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=120&h=120&fit=crop" },
  { id: "Deals", count: 56, image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=120&h=120&fit=crop" },
];

interface CategoriesProps {
  language: Language;
  onCategorySelect: (category: string) => void;
}

const Categories = ({ language, onCategorySelect }: CategoriesProps) => {
  const t = translations[language];
  const categories = baseCategories.map((category, index) => ({
    ...category,
    name: t.categories.list[index],
  }));

  return (
    <section id="categories" className="py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.categories.title}
          </h2>
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => {
              onCategorySelect("All");
              scrollToId("products");
            }}
          >
            {t.categories.viewAll}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {categories.map((category) => (
              <div
                key={category.name}
                className="bg-background rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer group hover:-translate-y-1 text-center"
                onClick={() => {
                  onCategorySelect(category.id);
                  scrollToId("products");
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onCategorySelect(category.id);
                    scrollToId("products");
                  }
                }}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm mb-3 mx-auto group-hover:scale-105 transition-transform">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category.count} {t.categories.items}
                </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
