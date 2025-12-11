import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Action", slug: "action", typeScope: "UNIVERSAL" as const, sortOrder: 1 },
  { name: "Romance", slug: "romance", typeScope: "UNIVERSAL" as const, sortOrder: 2 },
  { name: "Comedy", slug: "comedy", typeScope: "UNIVERSAL" as const, sortOrder: 3 },
  { name: "Fantasy", slug: "fantasy", typeScope: "UNIVERSAL" as const, sortOrder: 4 },
  { name: "Horror", slug: "horror", typeScope: "UNIVERSAL" as const, sortOrder: 5 },
  { name: "Sci-Fi", slug: "sci-fi", typeScope: "UNIVERSAL" as const, sortOrder: 6 },
  { name: "Slice of Life", slug: "slice-of-life", typeScope: "UNIVERSAL" as const, sortOrder: 7 },
  { name: "Drama", slug: "drama", typeScope: "UNIVERSAL" as const, sortOrder: 8 },
];

const mangaContent = [
  {
    title: "One Piece",
    slug: "one-piece",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
    description: "Follow Monkey D. Luffy and his pirate crew in their quest to find the legendary treasure One Piece.",
    externalUrl: "https://example.com/one-piece",
    viewsTotal: 15000,
    clicksTotal: 8500,
    categories: ["action", "fantasy", "comedy"],
  },
  {
    title: "Naruto",
    slug: "naruto",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop",
    description: "The story of Naruto Uzumaki, a young ninja who seeks recognition and dreams of becoming the Hokage.",
    externalUrl: "https://example.com/naruto",
    viewsTotal: 12000,
    clicksTotal: 6800,
    categories: ["action", "fantasy"],
  },
  {
    title: "Attack on Titan",
    slug: "attack-on-titan",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&h=600&fit=crop",
    description: "Humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures.",
    externalUrl: "https://example.com/aot",
    viewsTotal: 18000,
    clicksTotal: 9200,
    categories: ["action", "horror", "drama"],
  },
  {
    title: "My Hero Academia",
    slug: "my-hero-academia",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop",
    description: "A story about a boy born without powers in a world where 80% of the population has superpowers.",
    externalUrl: "https://example.com/mha",
    viewsTotal: 10500,
    clicksTotal: 5400,
    categories: ["action", "comedy"],
  },
  {
    title: "Demon Slayer",
    slug: "demon-slayer",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    description: "Tanjiro Kamado becomes a demon slayer after his family is slaughtered and his sister is turned into a demon.",
    externalUrl: "https://example.com/demon-slayer",
    viewsTotal: 14000,
    clicksTotal: 7800,
    categories: ["action", "fantasy", "drama"],
  },
  {
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    type: "MANGA" as const,
    imageUrl: "https://images.unsplash.com/photo-1560972550-aba3456b5564?w=400&h=600&fit=crop",
    description: "Yuji Itadori joins a secret organization of Jujutsu Sorcerers to kill a powerful Curse named Ryomen Sukuna.",
    externalUrl: "https://example.com/jjk",
    viewsTotal: 11000,
    clicksTotal: 6200,
    categories: ["action", "horror"],
  },
];

const animeContent = [
  {
    title: "Spirited Away",
    slug: "spirited-away",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    description: "A young girl finds herself in a mystical world of spirits and must work to save her parents.",
    externalUrl: "https://example.com/spirited-away",
    viewsTotal: 22000,
    clicksTotal: 12000,
    categories: ["fantasy", "drama"],
  },
  {
    title: "Your Name",
    slug: "your-name",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=400&h=600&fit=crop",
    description: "Two teenagers share a profound connection after they begin switching bodies.",
    externalUrl: "https://example.com/your-name",
    viewsTotal: 19500,
    clicksTotal: 10800,
    categories: ["romance", "fantasy", "drama"],
  },
  {
    title: "Fullmetal Alchemist Brotherhood",
    slug: "fullmetal-alchemist-brotherhood",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop",
    description: "Two brothers use alchemy to search for the Philosopher's Stone to restore their bodies.",
    externalUrl: "https://example.com/fmab",
    viewsTotal: 25000,
    clicksTotal: 14000,
    categories: ["action", "fantasy", "drama"],
  },
  {
    title: "Steins;Gate",
    slug: "steins-gate",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=400&h=600&fit=crop",
    description: "A self-proclaimed mad scientist discovers time travel through a modified microwave.",
    externalUrl: "https://example.com/steins-gate",
    viewsTotal: 16000,
    clicksTotal: 8900,
    categories: ["sci-fi", "drama"],
  },
  {
    title: "Violet Evergarden",
    slug: "violet-evergarden",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    description: "A former soldier becomes a letter writer to understand the meaning of love.",
    externalUrl: "https://example.com/violet-evergarden",
    viewsTotal: 13500,
    clicksTotal: 7600,
    categories: ["drama", "slice-of-life"],
  },
  {
    title: "Death Note",
    slug: "death-note",
    type: "ANIME" as const,
    imageUrl: "https://images.unsplash.com/photo-1489367874814-f5d040621dd8?w=400&h=600&fit=crop",
    description: "A high school student discovers a supernatural notebook that can kill anyone whose name is written in it.",
    externalUrl: "https://example.com/death-note",
    viewsTotal: 21000,
    clicksTotal: 11500,
    categories: ["horror", "drama"],
  },
];

const movieContent = [
  {
    title: "Inception",
    slug: "inception",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
    description: "A thief who enters the dreams of others to steal secrets is given a chance to erase his criminal record.",
    externalUrl: "https://example.com/inception",
    viewsTotal: 28000,
    clicksTotal: 15500,
    categories: ["sci-fi", "action"],
  },
  {
    title: "The Dark Knight",
    slug: "the-dark-knight",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    description: "Batman faces his greatest psychological and physical tests as he fights the anarchist mastermind known as the Joker.",
    externalUrl: "https://example.com/dark-knight",
    viewsTotal: 32000,
    clicksTotal: 18000,
    categories: ["action", "drama"],
  },
  {
    title: "Interstellar",
    slug: "interstellar",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop",
    description: "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
    externalUrl: "https://example.com/interstellar",
    viewsTotal: 26000,
    clicksTotal: 14200,
    categories: ["sci-fi", "drama"],
  },
  {
    title: "Parasite",
    slug: "parasite",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    description: "A poor family schemes to become employed by a wealthy family and infiltrate their household.",
    externalUrl: "https://example.com/parasite",
    viewsTotal: 19000,
    clicksTotal: 10500,
    categories: ["drama", "comedy", "horror"],
  },
  {
    title: "The Matrix",
    slug: "the-matrix",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop",
    description: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    externalUrl: "https://example.com/the-matrix",
    viewsTotal: 30000,
    clicksTotal: 16800,
    categories: ["sci-fi", "action"],
  },
  {
    title: "Blade Runner 2049",
    slug: "blade-runner-2049",
    type: "MOVIE" as const,
    imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=600&fit=crop",
    description: "A young blade runner discovers a secret that leads him to track down a former blade runner who has been missing for thirty years.",
    externalUrl: "https://example.com/blade-runner-2049",
    viewsTotal: 17500,
    clicksTotal: 9600,
    categories: ["sci-fi", "drama"],
  },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.contentCategory.deleteMany();
  await prisma.content.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Created admin user: admin@example.com / admin123");

  // Create categories
  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: cat,
      })
    )
  );

  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c.id]));

  // Create manga content
  for (const manga of mangaContent) {
    const { categories: cats, ...contentData } = manga;
    const content = await prisma.content.create({
      data: contentData,
    });

    for (const catSlug of cats) {
      const categoryId = categoryMap.get(catSlug);
      if (categoryId) {
        await prisma.contentCategory.create({
          data: {
            contentId: content.id,
            categoryId,
          },
        });
      }
    }
  }

  // Create anime content
  for (const anime of animeContent) {
    const { categories: cats, ...contentData } = anime;
    const content = await prisma.content.create({
      data: contentData,
    });

    for (const catSlug of cats) {
      const categoryId = categoryMap.get(catSlug);
      if (categoryId) {
        await prisma.contentCategory.create({
          data: {
            contentId: content.id,
            categoryId,
          },
        });
      }
    }
  }

  // Create movie content
  for (const movie of movieContent) {
    const { categories: cats, ...contentData } = movie;
    const content = await prisma.content.create({
      data: contentData,
    });

    for (const catSlug of cats) {
      const categoryId = categoryMap.get(catSlug);
      if (categoryId) {
        await prisma.contentCategory.create({
          data: {
            contentId: content.id,
            categoryId,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
