# MDD - Monde de Dév

Réseau social pour développeurs

## Description

MDD (Monde de Dév) est une plateforme permettant aux développeurs de s'abonner à des sujets de programmation, publier des articles et échanger via des commentaires.

## Getting Started

### Prerequisites

- Node.js 22+
- npm ou yarn
- PostgreSQL

### Installation

```bash
git clone <repository-url>
cd P5-DFSJS
npm install
```

### Base de données (Docker)

Lancer une instance PostgreSQL en local avec Docker :

```bash
docker run --name mdd-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mdd_db -p 5432:5432 -d postgres:17
```

Pour arrêter / relancer le conteneur :

```bash
docker stop mdd-postgres
docker start mdd-postgres
```

### Configuration

1. Copier le fichier d'environnement :

```bash
cp .env.example .env
```

2. Les variables par défaut dans `.env` correspondent au conteneur Docker ci-dessus :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mdd_db?schema=public"
AUTH_SECRET="your-secret-key-here-change-in-production"
AUTH_URL="http://localhost:3000"
```

3. Initialiser la base de données :

```bash
npx prisma generate
npx prisma db push
```

### Lancement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod

## Features

- Authentification utilisateur (inscription/connexion)
- Gestion de profil
- Abonnement à des thèmes
- Publication d'articles
- Commentaires sur articles
- Fil d'actualité personnalisé

## Project Structure

```
P5-DFSJS/
├── app/               # App Router (Next.js 16)
│   ├── layout.tsx
│   └── page.tsx
├── components/        # Composants UI (shadcn/ui)
│   └── ui/
├── lib/               # Utilitaires
│   └── utils.ts
├── prisma/            # Database schema
│   └── schema.prisma
├── public/            # Static files
└── package.json
```

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## License

MIT License
