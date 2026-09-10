import { getThemes } from "@/features/themes/actions";

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
  const listThemes = themes.map((theme => {
    return <li key={theme.id}>
      <p>
        <b>{theme.name}</b>
        {" " + theme.description + " "}
      </p>
    </li>
  }))

  return <ul>{listThemes}</ul>
}