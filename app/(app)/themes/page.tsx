import { getThemes } from "@/features/themes/actions";
import {
  getSubscriptionsByUser,
  subscribe,
} from "@/features/subscriptions/actions";

/**
 * Themes page (`/themes`).
 *
 * Server Component that lists all available themes, sorted alphabetically.
 * Data is fetched server-side via the `getThemes` Server Action — no
 * client-side fetching and no user interaction yet.
 *
 * @remarks
 * Deliberately unstyled markup for now (project Steps 4/5: validate the
 * front → Server Action → Prisma → DB flow end-to-end before any visual
 * design is applied in Step 6).
 */
export default async function Page() {
  const themes = await getThemes();
  const subscriptions = await getSubscriptionsByUser();
  const themeSubscribedList: Set<string> = new Set();
  subscriptions.forEach((el) => themeSubscribedList.add(el.themeId));
  const listThemes = themes.map((theme) => {
    return (
      <li key={theme.id}>
        <p>
          <b>{theme.name}</b>
          {" " + (theme.description || "") + " "}
        </p>

        <form action={subscribe.bind(null, theme.id)}>
          <button type="submit" disabled={themeSubscribedList.has(theme.id)}>
            {" "}
            {themeSubscribedList.has(theme.id) ? "Déjà abonné" : "S'abonner"}
          </button>
        </form>
      </li>
    );
  });

  return <ul>{listThemes}</ul>;
}
