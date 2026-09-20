import type { Theme } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ThemeCardProps = {
  theme: Theme;
  buttonLabel: string;
  buttonAction: (formData: FormData) => void | Promise<void>;
  buttonDisabled?: boolean;
};

const ThemeCard = ({
  theme,
  buttonLabel,
  buttonAction,
  buttonDisabled,
}: ThemeCardProps) => {
  return (
    <Card className="min-h-[181px] w-full max-w-[265px] justify-between gap-3 border-0 shadow-none bg-[#F5F5F5] py-4 md:min-h-[161px] md:max-w-[392px]">
      <CardHeader>
        <CardTitle className="text-base font-bold">{theme.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3 text-sm">
          {theme.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="justify-center">
        <form action={buttonAction}>
          <Button
            type="submit"
            disabled={buttonDisabled}
            className="h-10 w-[139px] disabled:bg-[#939393] disabled:text-white disabled:opacity-100 md:w-[167px]"
          >
            {buttonLabel}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ThemeCard;
