import ThemeCard from "@/components/ThemeCard";
import { getUserInformation } from "@/features/profile/actions";
import { ProfileForm } from "@/features/profile/ProfileForm";
import {
  getSubscriptionsWithTheme,
  unsubscribe,
} from "@/features/subscriptions/actions";

export default async function Page() {
  const userInfo = await getUserInformation();
  const subscribedThemes = await getSubscriptionsWithTheme();

  return (
    <>
      <div className="bg-background">
        <h2 className="pt-8 text-center text-xl font-bold">
          Profil utilisateur
        </h2>
        <ProfileForm userInfo={userInfo} />
      </div>
      <div>
        <h2 className="pt-8 text-center text-xl font-bold">Abonnements</h2>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {subscribedThemes.map((subscription) => (
            <ThemeCard
              key={subscription.theme.id}
              theme={subscription.theme}
              buttonLabel="Se désabonner"
              buttonAction={unsubscribe.bind(null, subscription.theme.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
