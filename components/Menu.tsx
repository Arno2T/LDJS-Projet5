import { logout } from "@/features/auth/actions";
import Image from "next/image";
import Link from "next/link";
import ProfileIcon from "./ProfileIcon";
import MobileMenuToggle from "./MobileMenuToggle";

const Menu = () => {
  return (
    <nav
      aria-label="Navigation principale"
      className="flex h-[84px] items-center justify-between border-b border-border bg-background pl-[45px] pr-6"
    >
      <Link href="/articles" className="shrink-0">
        <Image
          preload={true}
          src="/logo_mdd.png"
          width={140}
          height={81}
          alt="Logo du site MDD"
        />
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        <form action={logout} className="inline-flex">
          <button
            type="submit"
            className="text-sm font-medium text-destructive transition-colors hover:opacity-80"
          >
            Se déconnecter
          </button>
        </form>
        <Link
          href="/articles"
          className="text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          Articles
        </Link>
        <Link
          href="/themes"
          className="text-sm font-medium text-foreground transition-colors hover:text-primary pr-20"
        >
          Thèmes
        </Link>
        <Link href="/profile">
          <ProfileIcon />
        </Link>
      </div>
      <div className="md:hidden">
        <MobileMenuToggle>
          <div className="flex flex-col items-end gap-6">
            <form action={logout} className="inline-flex">
              <button
                type="submit"
                className="text-sm font-medium text-destructive transition-colors hover:opacity-80"
              >
                Se déconnecter
              </button>
            </form>
            <Link
              href="/articles"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Articles
            </Link>
            <Link
              href="/themes"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Thèmes
            </Link>
          </div>
          <Link href="/profile">
            <ProfileIcon />
          </Link>
        </MobileMenuToggle>
      </div>
    </nav>
  );
};

export default Menu;
