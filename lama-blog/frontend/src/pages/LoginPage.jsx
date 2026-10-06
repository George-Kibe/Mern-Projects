import { SignIn } from "@clerk/react";

const LoginPage = () => (
  <div className="container-page flex justify-center py-12 md:py-16">
    <SignIn signUpUrl="/register" />
  </div>
);

export default LoginPage;
