# Bookmark - Manga, Anime, and Movies Content Directory

## Overview
A Next.js 16 web application for discovering and bookmarking manga, anime, and movies. Features an admin panel for content management with multi-URL support, partner website management, and safe redirect system.

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
│   │   │   ├── links/   # Content links management
│   │   │   ├── partners/# Partner websites management
│   │   │   ├── reports/ # Content reports management
│   │   │   └── ...
│   │   ├── api/         # API routes
│   │   │   ├── admin/   # Admin-only APIs
│   │   │   └── public/  # Public APIs
│   │   ├── redirect/    # Safe redirect system
│   │   ├── anime/       # Anime listing page
│   │   ├── manga/       # Manga listing page
│   │   ├── movies/      # Movies listing page
│   │   └── content/     # Content detail pages
│   ├── components/      # React components
│   └── lib/             # Utility libraries (prisma, auth, etc.)
└── public/              # Static assets
```

## Key Features

### Multi-URL Content System
- Multiple verified external URLs per content item
- Link types: READ, WATCH, DOWNLOAD, VISIT, MIRROR, EXTERNAL
- Link status: PENDING, VERIFIED, REJECTED
- Priority ordering for links
- Click tracking and analytics

### Partner Website Management
- Partner profiles with logos and descriptions
- Verification status for partners
- Links can be associated with partners

### Safe Redirect System
- All external links go through `/redirect/[slug]/[linkId]`
- Countdown timer with ads before redirect
- Only verified links are accessible
- Unverified links redirect back to content page
- Click tracking for analytics

### User Interactions
- Bookmark content items
- Report content issues
- Share content (native share, copy link, social media)

### Admin Panel
- Content management (CRUD)
- Links management per content
- Partner management
- Reports review and resolution

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

## Database Models

### Core Models
- **Content**: Main content items (manga, anime, movies)
- **Category**: Custom categories with type scope
- **Admin**: Admin users for panel access

### New Models (Dec 2024)
- **ContentLink**: Multiple URLs per content with metadata
- **Partner**: Partner websites that provide content
- **Bookmark**: User bookmarks for content
- **ContentReport**: User reports for content issues
- **LinkClick**: Click tracking analytics

## Recent Changes
- **Dec 2024**: Added multi-URL content system
  - Multiple verified external URLs per content
  - Partner website management
  - Safe redirect system with ads
  - User bookmarks and reports
  - Click tracking analytics
- **Dec 2024**: Redesigned entire UI with elegant modern design
  - Gradient hero sections on all pages
  - Modern card-based content layouts
  - Fully responsive navigation
  - Updated admin panel with dashboard statistics

## Admin Credentials (Demo)
- **Email**: admin@bookmark.com
- **Password**: admin123
- **Access**: Admin panel only accessible via /admin URL

## Design System
- **Primary Colors**: Indigo-purple gradient theme
- **Category Colors**: 
  - Manga: Indigo/purple
  - Anime: Pink/rose  
  - Movies: Amber/orange
- **UI Components**: Rounded cards, shadow effects, gradient buttons
- **Typography**: Clean sans-serif with proper hierarchy

## Security Considerations
- Only VERIFIED links are shown to users
- Unverified links cannot bypass the redirect safety layer
- Admin-only routes protected by authentication
- All redirects go through the safe redirect page
