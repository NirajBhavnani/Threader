import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

// Here, destructuring is done --- what if we click on some other user's profile icon
const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser();
  if (!user) return null; //clerk will automatically redirect us if we're not logged in

  // fetch the userInfo of the profile we just clicked
  const userInfo = await fetchUser(params.id);

  return(
    <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id} //to determine if current logged-in user looks at their own profile or other
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
    />
  );
};

export default ProfilePage;
