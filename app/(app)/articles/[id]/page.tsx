import { getArticleById } from "@/features/articles/actions";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h2>{article.title}</h2>
      <p>{article.theme.name}</p>
      <p>{new Date(article.createdAt).toLocaleDateString("fr-FR")} </p>
      <p>{article.content}</p>
    </div>
  );
}
