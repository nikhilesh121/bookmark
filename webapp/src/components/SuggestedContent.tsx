import Link from "next/link";

type SuggestedItem = {
  id: number;
  title: string;
  slug: string;
  type: "MANGA" | "ANIME" | "MOVIE";
  imageUrl: string;
  rating: number | null;
};

type SuggestedContentProps = {
  items: SuggestedItem[];
  currentType: string;
};

const typeColors: Record<string, string> = {
  MANGA: "from-indigo-600 to-purple-600",
  ANIME: "from-pink-500 to-rose-500",
  MOVIE: "from-amber-500 to-orange-500",
};

export function SuggestedContent({ items, currentType }: SuggestedContentProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        You May Also Like
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {items.map((item) => {
          const gradientClass = typeColors[item.type] || "from-zinc-600 to-zinc-800";
          
          return (
            <Link
              key={item.id}
              href={`/content/${item.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700 aspect-[3/4]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wide bg-gradient-to-r ${gradientClass} text-white mb-1`}>
                    {item.type}
                  </span>
                  <h3 className="text-xs font-medium text-white line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  {item.rating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <span className="text-yellow-400 text-[10px]">★</span>
                      <span className="text-[10px] text-white/80">{item.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
