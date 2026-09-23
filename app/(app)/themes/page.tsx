import { getThemes } from "@/features/themes/actions";
import {
  getSubscriptionsByUser,
  subscribe,
} from "@/features/subscriptions/actions";
import ThemeCard from "@/components/ThemeCard";

/**
 * Themes page (`/themes`).
 *
 * Server Component that lists all available themes, sorted alphabetically.
 * Data is fetched server-side via the `getThemes` Server Action — no
 * client-side fetching and no user interaction yet.
 *
 */
export default async function Page() {
  const themes = await getThemes();
  const subscriptions = await getSubscriptionsByUser();
  const themeSubscribedList: Set<string> = new Set();
  subscriptions.forEach((el) => themeSubscribedList.add(el.themeId));
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          buttonLabel={
            themeSubscribedList.has(theme.id) ? "Déjà abonné" : "S'abonner"
          }
          buttonDisabled={themeSubscribedList.has(theme.id)}
          buttonAction={subscribe.bind(null, theme.id)}
        />
      ))}
    </div>
  );
}
