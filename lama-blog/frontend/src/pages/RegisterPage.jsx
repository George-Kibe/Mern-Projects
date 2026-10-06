import { SignUp } from "@clerk/react";

const RegisterPage = () => (
  <div className="container-page flex justify-center py-12 md:py-16">
    <SignUp signInUrl="/login" />
  </div>
);

export default RegisterPage;
