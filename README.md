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
git clone https://github.com/Arno2T/LDJS-Projet5.git
cd LDJS-Projet5
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
JWT_SECRET="your-secret-key-here-change-in-production"
```

3. Initialiser la base de données à partir des migrations versionnées du repo :

```bash
npx prisma generate
npx prisma migrate deploy
```

`npx prisma migrate dev` peut être utilisé à la place pendant le développement si `prisma/schema.prisma` est modifié localement (crée une nouvelle migration).

### Lancement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Tests

La suite de tests (unitaires, intégration, e2e) tourne contre une base PostgreSQL **dédiée**, distincte de la base de développement, pour ne jamais écrire ni vider (`resetDb()`) les données de `npm run dev`.

### Base de données de test

1. Lancer un second conteneur PostgreSQL, sur un port différent :

```bash
docker run --name mdd-postgres-test -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=mdd_db_test -p 5433:5432 -d postgres:17
```

2. Copier le fichier d'environnement de test :

```bash
cp .env.test.example .env.test
```

`.env.test` pointe par défaut sur ce conteneur (`localhost:5433`, base `mdd_db_test`). Les tests refusent de démarrer si `DATABASE_URL` ne contient pas `mdd_db_test`, pour ne jamais pouvoir viser la base de développement par erreur.

3. Appliquer les migrations sur la base de test :

```bash
npm run db:test:migrate
```

### Lancer les tests

```bash
npm run test:unit        # Server Actions, lib/, schémas Zod — base de test réelle
npm run test:integration # Composants React (Testing Library) — jsdom, sans base
npm run test:coverage    # Suite complète avec rapport de couverture (seuils 75 %)
npm run test:e2e         # Parcours critique de bout en bout (Playwright)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Langage**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **Base de données**: PostgreSQL
- **ORM**: Prisma 6
- **Validation**: Zod
- **Authentification**: JWT "maison" (`jose`), cookie de session `httpOnly`, mots de passe hachés avec Argon2
- **Tests**: Vitest + React Testing Library (unit/intégration), Playwright (e2e)

## Features

- Authentification utilisateur (inscription/connexion)
- Gestion de profil
- Abonnement à des thèmes
- Publication d'articles
- Commentaires sur articles
- Fil d'actualité personnalisé

## Project Structure

```
LDJS-P5/
├── app/                 # App Router : (public)/ (accueil, login, register)
│                        # et (app)/ (routes protégées : articles, thèmes, profil)
├── features/            # Logique métier par feature (Server Actions, schémas Zod, formulaires)
│   ├── articles/
│   ├── auth/
│   ├── comments/
│   ├── profile/
│   ├── subscriptions/
│   └── themes/
├── components/          # Composants partagés (Menu, ArticleCard, ThemeCard...)
│   └── ui/              # Primitives shadcn/ui
├── lib/                 # Code transverse (auth/session, prisma, validation, erreurs Prisma)
├── prisma/              # schema.prisma, migrations versionnées, seed.ts
├── tests/               # unit/, integration/, e2e/, setup/ (fixtures, base de test)
├── docs/diagrams/       # Diagrammes d'architecture et ERD (Mermaid)
├── proxy.ts             # Filtre des routes protégées (remplace middleware.ts)
└── package.json
```

## Documentation

- [`DOCUMENTATION.md`](DOCUMENTATION.md) — rapport de projet : périmètre fonctionnel, architecture, choix techniques, tests, FAQ
- [Diagramme d'architecture](docs/diagrams/architecture.mmd) ([SVG](docs/diagrams/architecture.svg))
- [Schéma entité-relation (ERD)](docs/diagrams/erd.svg) — généré depuis `prisma/schema.prisma` via `prisma-erd-generator` (voir le bloc `generator erd`)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## License

MIT License
