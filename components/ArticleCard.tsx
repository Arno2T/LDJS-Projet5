import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { ArticleWithAuthor } from "@/features/articles/actions";

const ArticleCard = ({ article }: { article: ArticleWithAuthor }) => {
  return (
    <Card className="relative min-h-[181px] w-full max-w-[265px] justify-between gap-0 border-0 shadow-none bg-[#F5F5F5] py-4 md:min-h-[161px] md:max-w-[392px]">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          <Link
            href={`/articles/${article.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {article.title}
          </Link>
          <div className="flex mt-1.5 gap-x-3">
            <CardDescription className="h-6 font-normal text-black leading-6 md:w-[137px]">
              {new Date(article.createdAt).toLocaleDateString("fr-FR")}
            </CardDescription>
            <CardDescription className="h-6 font-normal text-black leading-6 md:w-[137px]">
              {article.author.username}
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-[9px]">
        <CardDescription className="line-clamp-5 text-sm">
          {article.content}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
