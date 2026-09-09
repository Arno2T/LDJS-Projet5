import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {

  const hashPassword = await hash("password123");

  const jsTheme = await prisma.theme.upsert({
    where: {name: "Javascript"},
    update: {},
    create: {
      name: "Javascript",
      description: "Ici on parle de Javascript, Ecmascript, Typescript, React, Next, (mais pas Angular)"
    }
  });

  const pythonTheme = await prisma.theme.upsert({
    where: {name: "Python"},
    update: {},
    create: {
      name: "Python",
      description: "Ici on parle de Python, Django"
    }
  });

  const rustTheme = await prisma.theme.upsert({
    where: {name: "Rust"},
    update: {},
    create: {
      name: "Rust",
      description: "Ici on parle de Rust" 
    }
  });

  const bobby = await prisma.user.upsert({
    where: {email: "bobby@mdd-test.local"},
    update: {},
    create: {
      email: "bobby@mdd-test.local",
      username: "Bobby",
      password: hashPassword
    }
  });

   const jeannette = await prisma.user.upsert({
    where: {email: "jeannette@mdd-test.local"},
    update: {},
    create: {
      email: "jeannette@mdd-test.local",
      username: "Jeannette",
      password: hashPassword
    }
  });

  const article1 = await prisma.article.create({
    data: {
            title: "Les Nouveautés 2026",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            authorId: bobby.id,
            themeId: jsTheme.id,
            createdAt: new Date("2026-05-03")
          }
    });
      
  const article2 = await prisma.article.create({
     data: {
            title: "JS et IA",
            content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            authorId: bobby.id,
            themeId: jsTheme.id,
            createdAt: new Date("2026-07-02")
          }
          });
  
  const subscription = await prisma.subscription.upsert({
    where: {
      userId_themeId: {
        userId: jeannette.id,
        themeId: jsTheme.id
      }
    },
    update: {},
    create: {
      userId: jeannette.id,
      themeId: jsTheme.id
    }
  });

  const subscriptionBobbyRust = await prisma.subscription.upsert({
    where: {
      userId_themeId: {
        userId: bobby.id,
        themeId: rustTheme.id
      }
    },
    update: {},
    create: {
      userId: bobby.id,
      themeId: rustTheme.id
    }
  });

  const subscriptionJeannettePython = await prisma.subscription.upsert({
    where: {
      userId_themeId: {
        userId: jeannette.id,
        themeId: pythonTheme.id
      }
    },
    update: {},
    create: {
      userId: jeannette.id,
      themeId: pythonTheme.id
    }
  });

  const commentJeannetteJs = await prisma.comment.create({
     data: {
        authorId: jeannette.id,
        articleId: article1.id,
        content: "C'est mon premier commentaire"
     }
  })

}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });