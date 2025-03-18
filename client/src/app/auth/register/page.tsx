"use client"

import RegisterForm from '@/components/auth/register-form';
import SocialProviders from '@/components/auth/social-providers';



export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enter your details to create your Kaapi account
          </p>
        </div>
        <RegisterForm />
        <SocialProviders />
      </div>
    </div>
  );
}
