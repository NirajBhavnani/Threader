// Clerk offers a set of prebuilt components that you can use to embed sign in, sign up,
//  and other user management functions into your Next.js application.
// We are going to use the <SignIn />,<SignUp /> components.
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp />;
}