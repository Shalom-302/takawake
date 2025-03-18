"use client"

import RegisterForm from '@/components/auth/register-form';
import SocialProviders from '@/components/auth/social-providers';



export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
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
