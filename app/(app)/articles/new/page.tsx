import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { getThemes } from "@/features/themes/actions";
import { CreateArticleForm } from "@/features/articles/CreateArticleForm";

/**
 * Article creation page (`/articles/new`).
 *
 * Server Component that loads the available themes and hands them to the
 * client-side `CreateArticleForm`. The header is a 3-column grid
 * (`1fr auto 1fr`) so the title stays centered on the page; on mobile the
 * back arrow sits on its own row above the title.
 */
export default async function Page() {
  const themes = await getThemes();

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 gap-y-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        {/* pl-[21px] + px-6 (24px) = 45px, same left offset as the detail page */}
        <Link
          href="/articles"
          aria-label="Retour aux articles"
          className="flex h-8 items-center justify-self-start pl-[21px]"
        >
          <MoveLeft size={47} absoluteStrokeWidth />
        </Link>
        <h1 className="mb-12 text-center text-xl font-bold">
          Créer un nouvel article
        </h1>
      </div>
      <CreateArticleForm themes={themes} />
    </div>
  );
}
