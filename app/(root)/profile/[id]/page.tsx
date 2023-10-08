import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";

// Here, destructuring is done --- what if we click on some other user's profile icon
const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null; //clerk will automatically redirect us if we're not logged in

  // fetch the userInfo of the profile we just clicked
  const userInfo = await fetchUser(params.id);

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id} //to determine if current logged-in user looks at their own profile or other
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />
      <div className="mt-9">
        {/* shadcn components */}
        <Tabs defaultValue="threads" className="w-full">
          <TabsList className="tab">
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className="tab">
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  height={24}
                  width={24}
                  className="object-contain"
                />

                {/* Label hidden in mobile devices */}
                <p className="max-sm:hidden">{tab.label}</p>

                {/* Thread count box beside Threads tab label */}
                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                    {userInfo?.threads?.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className="w-full text-light-1"
            >
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ProfilePage;
