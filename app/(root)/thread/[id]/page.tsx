// dynamic routing in Next 13 is done with square brackets --- round brackets indicate route groups
// eg: thread/[id] -> localhost/thread/1234 --- (root)/thread/[id] -> localhost/thread/1234

import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// In Next.js get params from url by destructuring - 'params'
// Note: Below 'id' is same as route directory name
const Thread = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  // if we do have params.id then we also need the user
  const user = await currentUser();
  if (!user) return null;

  // if we do have user then we've to fetch userInfo from DB
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // to know on which thread we are currently on
  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={user?.id || ""}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      </div>
    </section>
  );
};

export default Thread;
