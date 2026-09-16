import { logout } from "@/features/auth/actions";
import Image from "next/image";
import Link from "next/link";

const Menu = () => {
  return (
    <nav>
      <Link href="/articles">
        <Image
          src="/logo_mdd.png"
          width={140}
          height={81}
          alt="Logo du site MDD"
        />
      </Link>
      <form action={logout}>
        <button type="submit">Se déconnecter</button>
      </form>
      <Link href="/articles">Articles</Link>
      <Link href="/themes">Thèmes</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
};

export default Menu;
