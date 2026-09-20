import { getUserInformation } from "@/features/profile/actions";
import { ProfileForm } from "@/features/profile/ProfileForm";

export default async function Page() {
  const userInfo = await getUserInformation();

  return (
    <div className="bg-background">
      <h1 className="pt-8 text-center text-xl font-bold">Profil utilisateur</h1>
      <ProfileForm userInfo={userInfo} />
    </div>
  );
}
