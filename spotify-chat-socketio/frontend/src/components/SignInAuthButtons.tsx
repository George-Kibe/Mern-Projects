import { useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	const { signIn, isLoaded } = useSignIn();

	if (!isLoaded) {
		return null;
	}

	const signInWithGoogle = () => {
		signIn.authenticateWithRedirect({
			strategy: "oauth_google",
			redirectUrl: "/sso-callback",
			redirectUrlComplete: "/auth-callback",
		});
	};

	return (
		<Button onClick={signInWithGoogle} variant={"secondary"} className='w-full border-zinc-200 h-11'>
			<img src='/google.png' alt='Google' className='size-5' />
			<p className="text-black">Continue with Google</p>
		</Button>
	);
};
export default SignInOAuthButtons;