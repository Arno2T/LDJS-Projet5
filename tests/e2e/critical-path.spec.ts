import { expect, test } from "@playwright/test";
import { hashPassword } from "@/lib/auth/password";
import { createTestUser, testPrisma } from "../setup/db";

const PASSWORD = "Abcdef12";

test.describe("critical path", () => {
  test("register -> subscribe -> write an article -> comment -> feed -> logout -> login", async ({
    page,
  }) => {
    const username = "e2e-user";
    const email = "e2e-user@mdd-test.local";
    const title = "My first article about TypeScript";
    const content = "TypeScript adds static types to JavaScript. ".repeat(10);
    const comment = "Great article, thanks for sharing!";

    // 1. Register
    await page.goto("/register");
    await page.getByLabel("Nom d'utilisateur").fill(username);
    await page.getByLabel("Adresse e-mail").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: /inscrire/i }).click();

    // 2. Redirected to the feed (empty: no subscription yet), then subscribe
    await expect(page).toHaveURL(/\/articles$/);
    await page.getByRole("link", { name: "Thèmes" }).first().click();
    await expect(page).toHaveURL(/\/themes$/);
    await expect(page.getByText("TypeScript").first()).toBeVisible();
    await page.getByRole("button", { name: "S'abonner" }).click();
    await expect(
      page.getByRole("button", { name: "Déjà abonné" }),
    ).toBeDisabled();

    // 3. Create an article in that theme
    await page.goto("/articles/new");
    await page
      .getByLabel("Thème de l'article")
      .selectOption({ label: "TypeScript" });
    await page.getByLabel("Titre de l'article").fill(title);
    await page.getByLabel("Contenu de l'article").fill(content);
    await page.getByRole("button", { name: "Créer", exact: true }).click();

    // 4. Redirected to the article detail: real content is displayed
    await expect(page).toHaveURL(/\/articles\/[^/]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText(username, { exact: true })).toBeVisible();
    await expect(
      page.getByText("Aucun commentaire pour le moment."),
    ).toBeVisible();

    // 5. Comment on it
    await page.getByLabel("Écrivez ici votre commentaire").fill(comment);
    await page.getByRole("button", { name: "Envoyer le commentaire" }).click();
    await expect(page.getByText(comment)).toBeVisible();
    await expect(
      page.getByText("Aucun commentaire pour le moment."),
    ).toHaveCount(0);

    // 6. Back to the feed: the article is there
    await page.getByRole("link", { name: "Retour aux articles" }).click();
    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByRole("link", { name: title })).toBeVisible();

    // 7. Log out, then log in again with the same credentials
    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/login");
    await page.getByLabel("E-mail ou nom d'utilisateur").fill(email);
    await page.getByLabel("Mot de passe").fill(PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page).toHaveURL(/\/articles$/);
    await expect(page.getByRole("link", { name: title })).toBeVisible();
  });

  test("login with a wrong password shows the generic error and does not redirect", async ({
    page,
  }) => {
    await createTestUser({
      username: "e2e-known",
      email: "e2e-known@mdd-test.local",
      password: await hashPassword(PASSWORD),
    });

    await page.goto("/login");
    await page.getByLabel("E-mail ou nom d'utilisateur").fill("e2e-known");
    await page.getByLabel("Mot de passe").fill("Wrong1234");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByText("Email ou mot de passe non valide"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);

    // Protected page: still redirected away, so no session was created.
    await page.goto("/articles");
    await expect(page).not.toHaveURL(/\/articles$/);
  });

  test.afterAll(async () => {
    await testPrisma.$disconnect();
  });
});
