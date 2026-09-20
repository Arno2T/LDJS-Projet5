import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArticleWithAuthor } from "@/features/articles/actions";

const ArticleCard = ({ article }: { article: ArticleWithAuthor }) => {
  return (
    <Card className="min-h-[181px] w-full max-w-[265px] justify-between gap-3 border-0 shadow-none bg-[#F5F5F5] py-4 md:min-h-[161px] md:max-w-[392px]">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          {article.title}
          Date: {new Date(article.createdAt).toLocaleDateString("fr-FR")}
          Auteur: {article.author.username}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-sm">
          {article.content}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
