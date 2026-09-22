import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src="/logo_mdd.png"
            alt="Logo MDD"
            width={412}
            height={238}
            priority
            className="w-[225px] h-[130px] md:w-[412px] md:h-[238px]"
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-10 md:flex-row md:gap-12">
          <Button
            variant="outline"
            asChild
            className="w-[156px] h-10 bg-white text-black border-black hover:bg-white hover:text-primary hover:border-primary"
          >
            <Link href="/login">Se connecter</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-[156px] h-10 bg-white text-black border-black hover:bg-white hover:text-primary hover:border-primary"
          >
            <Link href="/register">S&apos;inscrire</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
