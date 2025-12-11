# Bookmark - Manga, Anime, and Movies Content Directory

## Overview
A Next.js 16 web application for discovering and bookmarking manga, anime, and movies. Features an admin panel for content management.

## Project Architecture
- **Framework**: Next.js 16 with Turbopack
- **Database**: PostgreSQL with Prisma 7 ORM
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## Directory Structure
```
webapp/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Prisma schema definition
│   └── migrations/      # Database migrations
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── admin/       # Admin panel pages
│   │   ├── api/         # API routes
│   │   ├── anime/       # Anime listing page
│   │   ├── manga/       # Manga listing page
│   │   ├── movies/      # Movies listing page
│   │   └── content/     # Content detail pages
│   ├── components/      # React components
│   └── lib/             # Utility libraries (prisma, auth, etc.)
└── public/              # Static assets
```

## Key Configuration
- **Dev Server**: Runs on port 5000 with host 0.0.0.0
- **Database URL**: Uses `DATABASE_URL` environment variable
- **Prisma Adapter**: Uses `@prisma/adapter-pg` for direct PostgreSQL connection

## Development Commands
- `npm run dev` - Start dev server on port 5000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate deploy` - Apply migrations

## Recent Changes
- **Dec 2024**: Redesigned entire UI with elegant modern design
  - Gradient hero sections on all pages with indigo/purple/pink/orange color themes
  - Modern card-based content layouts with hover effects
  - Fully responsive navigation with mobile-friendly design
  - Updated admin panel with dashboard statistics and quick actions
  - Elegant login page with gradient background
- Fixed Next.js 16 compatibility (searchParams is now Promise-based)
- Used route groups to separate login page from admin layout
- Added demo content: 6 manga, 6 anime, 6 movies with placeholder images
- Configured for Replit environment with proper host/port settings
- Added Prisma pg adapter for Prisma 7 compatibility
- Fixed missing database relations (Favorite, ViewHistory)
- Synced database schema with prisma db push

## Admin Credentials (Demo)
- **Email**: admin@example.com
- **Password**: admin123

## Design System
- **Primary Colors**: Indigo-purple gradient theme
- **Category Colors**: 
  - Manga: Indigo/purple
  - Anime: Pink/rose  
  - Movies: Amber/orange
- **UI Components**: Rounded cards, shadow effects, gradient buttons
- **Typography**: Clean sans-serif with proper hierarchy
