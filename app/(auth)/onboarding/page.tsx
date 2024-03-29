// Onboarding is basically a couple of steps you have to go through
// as soon as you create an account

import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null; // to avoid typescript warnings

  // This is coming from DB
  const userInfo = await fetchUser(user.id);
  if (userInfo?.onboarded) redirect("/");

  // We will have our own instance of user in DB so we can attach different threads to them
  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <main className="mx-auto flex-max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile now to use Threader
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        {/* For using AccountProfile, we have to provide current user info */}
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
