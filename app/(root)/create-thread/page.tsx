import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();

  if (!user) return null; //clerk will automatically redirect us if we're not logged in

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <div className="head-text">Create Thread</div>
      <PostThread userId={userInfo._id} />
    </>
  );
}

export default Page;
