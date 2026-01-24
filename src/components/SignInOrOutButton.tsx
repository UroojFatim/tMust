"use client";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";
import React from "react";

const SignInOrOutButton = () => {
  const { isSignedIn, userId } = useAuth();
  
  return (
    <div className="">
      {!isSignedIn && (
        <SignInButton mode="modal">
          <button className="bg-blue-400 rounded-full text-white p-2">Sign in</button>
        </SignInButton>
      )}
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default SignInOrOutButton;
